import Mailgun from "mailgun.js";
import formData from "form-data";

export async function sendEmail({
  recipient,
  html,
  subject = "JIA Update: Your Application Has Been Successfully Updated",
}) {
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
  });

  try {
    const msg = await mg.messages.create("hellojia.ai", {
      from: "noreply@hellojia.ai",
      to: [recipient],
      subject: subject,
      html: html,
    });

    console.log(msg);
    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: "Email sending failed",
    };
  }
}
