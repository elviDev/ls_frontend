import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

// Only initialize Resend if we have a valid API key
export const resend = apiKey && apiKey !== "your-resend-api-key" 
  ? new Resend(apiKey) 
  : null;
