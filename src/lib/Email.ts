import Mailgun from "mailgun.js";
import formData from "form-data";

type SendEmailParams = {
  recipient: string;
  html: string;
  subject?: string;
};

export async function sendEmail({
  recipient,
  html,
  subject = "JIA Update: Your Application Has Been Successfully Updated",
}: SendEmailParams) {
  const apiKey = process.env.MAILGUN_API_KEY;

  if (!apiKey) {
    console.warn(
      "MAILGUN_API_KEY is not set. Skipping email send for recipient:",
      recipient
    );
    return {
      success: false,
      message: "Mailgun API key is not configured",
    };
  }

  const domain = process.env.MAILGUN_DOMAIN || "hellojia.ai";

  try {
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: "api",
      key: apiKey,
    });

    const msg = await mg.messages.create(domain, {
      from: `noreply@${domain}`,
      to: [recipient],
      subject,
      html,
    });

    console.log(msg);
    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (err) {
    console.error("Mailgun error", err);
    return {
      success: false,
      message: "Email sending failed",
    };
  }
}
