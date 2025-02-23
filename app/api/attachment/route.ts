// app/api/attachment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import oauth2Client, { verifyAndRefreshToken } from "../../lib/google-oauth";

export async function GET(req: NextRequest) {
  try {
    const tokenData = await verifyAndRefreshToken();
    if (tokenData.error) {
        return NextResponse.json({ error: tokenData.error }, { status: tokenData.status });
    }
    oauth2Client.setCredentials({ access_token: tokenData.accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Get messageId and attachmentId from the URL
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");
    const attachmentId = searchParams.get("attachmentId");
   

    if (!messageId || !attachmentId) {
      return NextResponse.json(
        { error: "Missing messageId or attachmentId" },
        { status: 400 }
      );
    }

    // Fetch the attachment data from Gmail
    const attachment = await gmail.users.messages.attachments.get({
      userId: "me",
      messageId: messageId,
      id: attachmentId,
    });

    const data = attachment.data.data;
    // Use a default MIME type if none is returned
    const mimeType=searchParams.get("mimeType")|| "application/octet-stream";


    if (!data) {
      return NextResponse.json(
        { error: "No attachment data found" },
        { status: 404 }
      );
    }

    // Convert the base64 data to a Buffer
    const fileBuffer = Buffer.from(data, "base64");

    // Return the fileBuffer with the appropriate Content-Type header
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: { "Content-Type": mimeType },
    });
  } catch (error) {
    console.error("Error fetching attachment:", error);
    return NextResponse.json(
      { error: "Error fetching attachment" },
      { status: 500 }
    );
  }
}
