import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/Email";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";
import moment from "moment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId } = body;

    // Validate required parameters
    if (!interviewId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: interviewId",
        },
        { status: 400 }
      );
    }

    // Fetch interview data
    const { db } = await connectMongoDB();
    const interview = await db
      .collection("interviews")
      .findOne({ _id: new ObjectId(interviewId) });

    if (!interview) {
      return NextResponse.json(
        {
          success: false,
          error: "Interview not found",
        },
        { status: 404 }
      );
    }

    // Prepare email content
    const emailSubject = `[Jia] Reminder to Submit CV for ${
      interview.jobTitle
    } role at WhiteCloak Technologies - ${moment().format("MMMM D, YYYY")}`;
    const emailContent = `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">

<head>
	<meta charset="utf-8">
	<meta name="x-apple-disable-message-reformatting">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<title>Application Follow-up</title>
</head>

<body style="margin:0;padding:0;background-color:#f6f7f9;">
	<center style="width:100%;background:#f6f7f9;">
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%"
			style="max-width:640px;margin:0 auto;background:#ffffff;">

			<!-- Logo -->
			<tr>
				<td style="text-align:center;padding:28px 0 10px;">
					<img src="https://www.hellojia.ai/jia-new-logo.png" alt="Company Logo" width="80" style="display:block;margin:0 auto;max-width:120px;">
          </td>
			</tr>

			<!-- Body -->
			<tr>
				<td
					style="padding:32px 28px;font-family:Arial,Helvetica,sans-serif;color:#1f2937;font-size:16px;line-height:1.6;">
					<p style="margin:0 0 16px;">Hi ${interview.name || "there"},</p>

					<p style="margin:0 0 24px;">
						Thank you for applying for the <strong>${interview.jobTitle}</strong> role at
						<strong>WhiteCloak Technologies</strong>.
						Please submit your CV via the button below at your earliest convenience. We are looking forward
						to your submission.
					</p>

					<!-- Button -->
					<p style="text-align:center;margin:24px 0;">
						<a href="https://www.hellojia.ai/whitecloak/applicant" target="_blank" style="background-color:#2563eb;color:#ffffff;text-decoration:none;
                        padding:12px 28px;border-radius:6px;font-size:16px;
                        font-family:Arial,Helvetica,sans-serif;display:inline-block;">
							Submit Your CV
						</a>
					</p>

					<p style="margin:32px 0 4px;">Best Regards,</p>
					<p style="margin:0;">WhiteCloak Technologies Recruiting Team</p>
				</td>
			</tr>

			<!-- Divider -->
			<tr>
				<td style="height:1px;background:#e5e7eb;"></td>
			</tr>

			<!-- Fallback URL -->
			<tr>
				<td
					style="padding:14px 28px;font-family:Arial,Helvetica,sans-serif;color:#6b7280;font-size:12px;line-height:1.4;">
					If the button above doesn't work, copy and paste this URL into your browser:
					<br>
					<span style="word-break:break-all;">https://www.hellojia.ai/whitecloak/applicant</span>
				</td>
			</tr>
		</table>
	</center>
</body>

</html>
    `;

    // Send email
    const result = await sendEmail({
      recipient: interview.email,
      subject: emailSubject,
      html: emailContent,
    });

    if (result.success) {
      // Update lastAutoReminder in database
      await db
        .collection("interviews")
        .updateOne(
          { _id: new ObjectId(interviewId) },
          { $set: { lastAutoReminder: new Date() } }
        );

      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        interviewId: interviewId,
      });
    } else {
      console.error("Email sending failed:", result.message);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send email",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in send-single-reminder endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
