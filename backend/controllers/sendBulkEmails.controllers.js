import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv";

dotenv.config(); 

const sendBulkEmails = async (emails, subject, htmlContent) => {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY; 

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = { name: "JobPortal", email: "sagarchavan0061@gmail.com" }; 
    sendSmtpEmail.to = emails.map(email => ({ email }));
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    try {
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Emails sent successfully:", response);
    } catch (error) {
        console.error("Error sending emails:", error.response?.data || error.message);
    }
};

export default sendBulkEmails;
