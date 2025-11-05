import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { sendEmail } from "@/lib/Email";
import { ObjectId } from "mongodb";

const getInvitationEmailTemplate = (
  email: string,
  orgName: string,
  role: string
) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to bottom, #4f04b9f0, #b79fcf76); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Jia</h1>
    </div>
    
    <div style="background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 20px;">
        Dear ${email},
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 20px;">
        We are pleased to invite you to join <strong>${orgName}</strong> on Jia as a <strong>${
  role.charAt(0).toUpperCase() + role.slice(1)
}</strong>. Your expertise and contribution will be valuable to our team.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 30px;">
        To get started, please click the button below to access your account:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.hellojia.ai" 
           style="background: #4f04b9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Click Here to Login
        </a>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 20px;">
        If you have any questions or need assistance, please don't hesitate to contact us.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #333333;">
        Best regards,<br>
        The Jia Team
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #666666; font-size: 14px;">
      <p>This is an automated message, please do not reply directly to this email.</p>
    </div>
  </div>
`;

export async function POST(req: Request) {
  const { orgID, email, role, careers } = await req.json();
  const { db } = await connectMongoDB();

  const member = await db.collection("members").findOne({ email, orgID });
  const org = await db
    .collection("organizations")
    .findOne({ _id: new ObjectId(orgID) });

  if (member) {
    if (member.status !== "invited") {
      return NextResponse.json(
        { message: "Member already exists" },
        { status: 400 }
      );
    }
    // If member exists and is still invited, just resend the email
    await sendEmail({
      recipient: email,
      html: getInvitationEmailTemplate(email, org?.name || "", role),
    });

    return NextResponse.json(
      { message: "Invitation email resent successfully" },
      { status: 200 }
    );
  }

  const newMember = {
    image: `https://api.dicebear.com/9.x/shapes/svg?seed=${email}`,
    name:
      email.split("@")[0].charAt(0).toUpperCase() +
      email.split("@")[0].slice(1),
    email,
    orgID,
    role,
    careers,
    addedAt: new Date(),
    lastLogin: null,
    status: "invited",
  };

  await db.collection("members").insertOne(newMember);
  await sendEmail({
    recipient: email,
    html: getInvitationEmailTemplate(email, org?.name || "", role),
  });

  return NextResponse.json(
    { message: "Member added successfully" },
    { status: 200 }
  );
}
