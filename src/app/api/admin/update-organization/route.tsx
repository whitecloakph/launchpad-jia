import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";
import { getInvitationEmailTemplate } from "@/lib/Utils";
import { sendEmail } from "@/lib/Email";

export async function POST(request: NextRequest) {
    const { orgID, update, members } = await request.json();
    if (!orgID) {
        return NextResponse.json({ error: "Organization ID and status are required" }, { status: 400 });
    }

    try {
        const { db } = await connectMongoDB();
        const organization = await db.collection("organizations").findOne({ _id: new ObjectId(orgID) });
        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        if (members) {
            // Validate unique emails
            const uniqueEmails = [...new Set(members.map((member: any) => member.email))];
            if (uniqueEmails.length !== members.length) {
                return NextResponse.json({ message: "Duplicate email addresses found" }, { status: 400 });
            }
            
            const existingMembers = await db.collection("members").find({ orgID: orgID }).toArray();
            const emails = members.map((m) => m.email);
            // Removed members
            const removedMembers = existingMembers.filter((m) => !emails.includes(m.email));
            if (removedMembers?.length > 0) {
                await db.collection("members").deleteMany({ _id: { $in: removedMembers.map((m) => m._id) }})
            }
            // New members
            const existingEmails = existingMembers.map((m) => m.email);
            const newMembers = members.filter((m) => !existingEmails.includes(m.email));
            if (newMembers?.length > 0) {
                await db.collection("members").insertMany(newMembers.map((member: any) => ({
                    image: `https://api.dicebear.com/9.x/shapes/svg?seed=${member.email}`,
                    name:
                    member.email.split("@")[0].charAt(0).toUpperCase() +
                    member.email.split("@")[0].slice(1),
                    email: member.email,
                    orgID: organization._id.toString(),
                    role: member.role,
                    careers: [],
                    addedAt: new Date(),
                    lastLogin: null,
                    status: "invited",
                })));
            
                // Send email to new members
                await Promise.all(newMembers.map((member: any) => sendEmail({
                    recipient: member.email,
                    html: getInvitationEmailTemplate(member.email, organization.name, member.role),
                })));
            }
            // Updated members
            const updatedMembers = existingMembers.filter((m) => emails.includes(m.email));
            if (updatedMembers?.length > 0) {
                await db.collection("members").bulkWrite(updatedMembers.map((m) => {
                    const updatedMember = members.find((member: any) => member.email === m.email);
                    return {
                        updateOne: {
                            filter: { _id: m._id },
                            update: { $set: { role: updatedMember.role } }
                        }
                    }
                }));
            }
        }

        await db.collection("organizations").updateOne({ _id: new ObjectId(orgID) }, { $set: { ...update, updatedAt: new Date(), } });
        return NextResponse.json({ message: "Organization status updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating organization:", error);
        return NextResponse.json({ error: "Error updating organization" }, { status: 500 });
    }
}