import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { sendEmail } from "@/lib/Email";
import { getInvitationEmailTemplate } from "@/lib/Utils";

export async function POST(request: NextRequest) {
  const { name, image, coverImage, description, status, organizationType, members, planId, extraJobSlots, country, province, city, address, documents, lastEditedBy, createdBy } = await request.json();

try {
    const { db } = await connectMongoDB();

    const existingOrganization = await db.collection("organizations").findOne({ name });
    if (existingOrganization) {
        return NextResponse.json({ message: "Organization already exists" }, { status: 400 });
    }

    // Save organization
    const organization = await db.collection("organizations").insertOne({
        creator: createdBy?.email,
        name,
        description,
        status,
        tier: organizationType,
        planId,
        extraJobSlots,
        country,
        province,
        city,
        address,
        createdAt: new Date(),
        updatedAt: new Date(),
        image,
        coverImage,
        documents,
        lastEditedBy,
        createdBy,
    });

    // Validate unique emails
    const uniqueEmails = [...new Set(members.map((member: any) => member.email))];
    if (uniqueEmails.length !== members.length) {
        return NextResponse.json({ message: "Duplicate email addresses found" }, { status: 400 });
    }

    // Save members
    await db.collection("members").insertMany(members.map((member: any) => ({
        image: `https://api.dicebear.com/9.x/shapes/svg?seed=${member.email}`,
        name:
          member.email.split("@")[0].charAt(0).toUpperCase() +
          member.email.split("@")[0].slice(1),
        email: member.email,
        orgID: organization.insertedId.toString(),
        role: member.role,
        careers: [],
        addedAt: new Date(),
        lastLogin: null,
        status: "invited",
    })));
    //Commented out sending email for new members to prevent errors upon creating organization.
    // Send email to new members
    // await Promise.all(members.map((member: any) => sendEmail({
    //     recipient: member.email,
    //     html: getInvitationEmailTemplate(member.email, name, member.role),
    // })));
    return NextResponse.json({ orgID: organization.insertedId.toString() });
} catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to add organization" }, { status: 500 });
}
}