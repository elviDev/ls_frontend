import { resend } from "../resend";
export const sendEmail = async (
  email: string,
  payload: {
    subject: string;
    html: string;
  }
) => {
  if (!resend) {
    throw new Error('Resend client is not initialized');
  }
  
  await resend.emails.send({
    from: "RadioStation <no-reply@yourapp.com>",
    to: email,
    subject: payload.subject,
    html: payload.html,
  });
};
