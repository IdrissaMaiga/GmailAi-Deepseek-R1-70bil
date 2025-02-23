import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import oauth2Client, { verifyAndRefreshToken } from "../../lib/google-oauth";
import { convert } from "html-to-text";






// Helper function to extract email body, inline images, and attachments
function extractMessageParts(parts: any[], extracted: any = { text: "", html: "", images: [], attachments: [] }) {
  parts.forEach((part) => {
    if (part.mimeType === "text/plain" && part.body?.data) {
      extracted.text = Buffer.from(part.body.data, "base64").toString("utf-8");
    }
    if (part.mimeType === "text/html" && part.body?.data) {
      extracted.html = Buffer.from(part.body.data, "base64").toString("utf-8");
    }
    if (part.filename && part.body?.attachmentId) {
      extracted.attachments.push({
        filename: part.filename,
        mimeType: part.mimeType,
        attachmentId: part.body.attachmentId,
      });
    }
    if (part.mimeType?.startsWith("image/") && part.body?.attachmentId) {
      extracted.images.push({
        filename: part.filename || "inline-image",
        mimeType: part.mimeType,
        attachmentId: part.body.attachmentId,
        cid: part.headers?.find((h:any) => h.name === "Content-ID")?.value?.replace(/[<>]/g, "") || "",
      });
    }
    if (part.parts) {
      extractMessageParts(part.parts, extracted); // Recursively extract nested parts
    }
  });

  return extracted;
}

export async function GET(req: NextRequest) {
  try {
    const tokenData = await verifyAndRefreshToken();
    if (tokenData.error) {
        return NextResponse.json({ error: tokenData.error }, { status: tokenData.status });
    }
    oauth2Client.setCredentials({ access_token: tokenData.accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");


    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    // Get message details
    const message = await gmail.users.messages.get({ userId: "me", id: messageId });
    const threadId = message.data.threadId;

    if (!threadId) {
      return NextResponse.json({ error: "No thread found" }, { status: 404 });
    }

    // Get the entire thread
    const thread = await gmail.users.threads.get({ userId: "me", id: threadId });
    const messages = thread.data.messages || [];

    // Extract email data from thread
    const structuredThread = messages.map((msg) => {
      const headers = msg.payload?.headers || [];
      const subject = headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
      const from = headers.find((h) => h.name === "From")?.value || "Unknown Sender";
      const to = headers.find((h) => h.name === "To")?.value || "Unknown Recipient";
      const date = headers.find((h) => h.name === "Date")?.value || "Unknown Date";

      // Extract body, inline images, and attachments
      const extractedData = extractMessageParts(msg.payload?.parts || []);
      let emailBody = extractedData.html || extractedData.text || "No content available";
    // Replace inline image CIDs with actual image sources
    extractedData.images.forEach((img: any) => {
      emailBody = emailBody.replace(
        new RegExp(`cid:${img.cid}`, "g"),  // Correctly escape and use backticks for template literals
        `/api/attachment?messageId=${msg.id}&attachmentId=${img.attachmentId}`
      );
    });
    
      

    // JSON format optimized for LLM analysis
    const llmData = {
      message_id: msg.id,
      thread_id: msg.threadId,
      metadata: {
        subject,
        from,
        to,
        date,
      },
      content: {
        text: (extractedData.text.replace(/\s+/g, " ").trim() + "  " + convert(extractedData.html || "")).replace(/\n/g, " "),
      },
      attachments: extractedData.attachments.map((att: any) => ({
        filename: att.filename,
        mimeType: att.mimeType,
      })),
    };
    
    
     console.log(JSON.stringify(llmData))
     
      return {
        id: msg.id,
        threadId: msg.threadId,
        subject,
        from,
        to,
        date,
        body: emailBody,
        attachments: extractedData.attachments,
      };
    });
 
    return NextResponse.json({ thread: structuredThread }, { status: 200 });
  } catch (error) {
    console.error("Error fetching thread:", error);
    return NextResponse.json({ error: "Failed to fetch thread" }, { status: 500 });
  }
}
