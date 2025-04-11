import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv";

dotenv.config();

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

export const sendEmail = async (to, subject, content) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = {
      sender: { email: process.env.EMAIL_FROM, name: "HireNest" },
      to: [{ email: to }],
      subject: subject,
      htmlContent: `<p>${content}</p>`, // Supports HTML
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Email send failed:", error);
  }
};
