import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { guid } from "@/lib/Utils";
import { ObjectId } from "mongodb";

/**
 * Basic XSS protection/sanitization helpers.
 * NOTE: We implement a lightweight sanitizer to avoid extra deps.
 * Rules:
 * - For plain text fields (e.g., jobTitle): strip ALL tags and dangerous protocols.
 * - For rich text fields (e.g., description): allow a small whitelist of tags/attrs,
 *   strip scripts/iframes, event handlers (on*), javascript/data protocols.
 */
const ALLOWED_HTML_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "code",
  "pre",
  "a",
]);

function stripTags(input: string): string {
  if (!input) return "";
  // Remove script/style/iframe/object/embed entirely
  let out = input.replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "");
  // Remove remaining tags
  out = out.replace(/<[^>]+>/g, "");
  return out;
}

function sanitizeAttrValue(value: string): string {
  const v = value.trim().replace(/"/g, "&quot;");
  // Disallow javascript:, data: and vbscript: protocols
  if (/^(javascript|data|vbscript):/i.test(v)) {
    return "#";
  }
  return v;
}

function sanitizeHtml(input: string): string {
  if (!input) return "";
  let html = input;
  // Drop script/style/iframe/object/embed blocks
  html = html.replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "");
  // Remove on* event handlers and style attributes
  html = html.replace(/\s(on\w+|style)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Allow only whitelisted tags; escape others
  html = html.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag, attrs) => {
    tag = String(tag).toLowerCase();
    if (!ALLOWED_HTML_TAGS.has(tag)) {
      // Not allowed ⇒ strip the whole tag
      return "";
    }

    // Process allowed attributes for <a>
    if (tag === "a") {
      // Keep only href; sanitize protocol
      const hrefMatch = attrs.match(/\shref\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i);
      const href = hrefMatch?.[0]
        ? ` href="${sanitizeAttrValue(hrefMatch[0].split("=")[1].replace(/^['"]|['"]$/g, ""))}"`
        : "";
      // Add rel noopener noreferrer and target _blank safety if external
      return `<${match.startsWith("</") ? "/" : ""}a${href}${match.startsWith("</") ? "" : ' rel="noopener noreferrer"'}>`;
    }

    // For other allowed tags, drop all attributes
    return `<${match.startsWith("</") ? "/" : ""}${tag}>`;
  });

  return html;
}

export async function POST(request: Request) {
  try {
    const {
      jobTitle,
      description,
      questions,
      lastEditedBy,
      createdBy,
      screeningSetting,
      orgID,
      requireVideo,
      location,
      workSetup,
      workSetupRemarks,
      status,
      salaryNegotiable,
      minimumSalary,
      maximumSalary,
      country,
      province,
      employmentType,
      teamMembers,
      cvSecretPrompt,
      preScreeningQuestions,
      aiScreeningSetting,
      aiSecretPrompt,
    } = await request.json();

    // Sanitize inputs
    const clean = {
      jobTitle: stripTags(String(jobTitle || "")).trim(),
      description: sanitizeHtml(String(description || "")),
      workSetup: stripTags(String(workSetup || "")).trim(),
      workSetupRemarks: stripTags(String(workSetupRemarks || "")).trim(),
      location: stripTags(String(location || "")).trim(),
      screeningSetting: stripTags(String(screeningSetting || "")).trim(),
      employmentType: stripTags(String(employmentType || "")).trim(),
      country: stripTags(String(country || "")).trim(),
      province: stripTags(String(province || "")).trim(),
      cvSecretPrompt: sanitizeHtml(String(cvSecretPrompt || "")),
      aiSecretPrompt: sanitizeHtml(String(aiSecretPrompt || "")),
      aiScreeningSetting: stripTags(String(aiScreeningSetting || "")).trim(),
    };

    // Validate required fields after sanitization
    if (!clean.jobTitle || !clean.description || !questions || !clean.location || !clean.workSetup) {
      return NextResponse.json(
        {
          error:
            "Job title, description, questions, location and work setup are required",
        },
        { status: 400 }
      );
    }

    // Length constraints to avoid abuse
    if (clean.jobTitle.length > 200) {
      return NextResponse.json({ error: "Job title is too long" }, { status: 400 });
    }
    if (clean.workSetupRemarks.length > 2000) {
      return NextResponse.json({ error: "Work setup remarks is too long" }, { status: 400 });
    }

    const { db } = await connectMongoDB();

    const orgDetails = await db.collection("organizations").aggregate([
      {
        $match: {
          _id: new ObjectId(orgID)
        }
      },
      {
        $lookup: {
            from: "organization-plans",
            let: { planId: "$planId" },
            pipeline: [
                {
                    $addFields: {
                        _idStr: { $toString: "$_id" }
                    }
                },
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $ne: ["$$planId", null] },
                                { $ne: ["$$planId", ""] },
                                { $eq: ["$_idStr", "$$planId"] }
                            ]
                        }
                    }
                }
            ],
            as: "plan"
        }
      },
      {
        $unwind: {
          path: "$plan",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          plan: {
            $ifNull: [
              "$plan",
              {
                _id: "default",
                name: "Default Plan",
                jobLimit: 100, // High default limit for development
                createdAt: new Date()
              }
            ]
          }
        }
      }
    ]).toArray();

    if (!orgDetails || orgDetails.length === 0) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const totalActiveCareers = await db.collection("careers").countDocuments({ orgID, status: "active" });
    const jobLimit = orgDetails[0].plan?.jobLimit || 100; // Default to 100 if no plan
    const extraJobSlots = orgDetails[0].extraJobSlots || 0;
    const maxJobs = jobLimit + extraJobSlots;

    // Allow bypassing in development via environment variable or skip check if limit is very high
    const bypassLimit = process.env.BYPASS_JOB_LIMIT === "true" || jobLimit >= 1000;
    
    if (!bypassLimit && totalActiveCareers >= maxJobs) {
      return NextResponse.json({ error: "You have reached the maximum number of jobs for your plan" }, { status: 400 });
    }

    const career = {
      id: guid(),
      jobTitle: clean.jobTitle,
      description: clean.description,
      questions,
      location: clean.location,
      workSetup: clean.workSetup,
      workSetupRemarks: clean.workSetupRemarks,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEditedBy,
      createdBy,
      status: status || "active",
      screeningSetting: clean.screeningSetting,
      orgID,
      requireVideo,
      lastActivityAt: new Date(),
      salaryNegotiable,
      minimumSalary,
      maximumSalary,
      country: clean.country,
      province: clean.province,
      employmentType: clean.employmentType,
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
      cvSecretPrompt: clean.cvSecretPrompt,
      preScreeningQuestions: Array.isArray(preScreeningQuestions) ? preScreeningQuestions : [],
      aiScreeningSetting: clean.aiScreeningSetting,
      aiSecretPrompt: clean.aiSecretPrompt,
    };

    await db.collection("careers").insertOne(career);

    return NextResponse.json({
      message: "Career added successfully",
      career,
    });
  } catch (error) {
    console.error("Error adding career:", error);
    return NextResponse.json(
      { error: "Failed to add career" },
      { status: 500 }
    );
  }
}
