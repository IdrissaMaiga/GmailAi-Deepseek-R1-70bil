import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import oauth2Client, { verifyAndRefreshToken } from "../../lib/google-oauth"; // Assuming you have oauth2Client setup for authorization
import { gmail_v1 } from "googleapis/build/src/apis/gmail/v1";

export async function GET(req: NextRequest) {
  try {
    const tokenData = await verifyAndRefreshToken();
    if (tokenData.error) {
        return NextResponse.json({ error: tokenData.error }, { status: tokenData.status });
    }
    oauth2Client.setCredentials({ access_token: tokenData.accessToken });

    // Initialize Gmail API with OAuth2 client
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Get the label and page token from query parameters
    const label = req.nextUrl.searchParams.get("label") || "inbox"; // Default to inbox if not provided
    const pageToken = req.nextUrl.searchParams.get("pageToken") || "";

    // Retrieve messages based on the selected label
    const emails = await listEmails(gmail, label.toUpperCase(), pageToken);

    return NextResponse.json({
      emails: emails.emails,
      nextPageToken: emails.nextPageToken,
    });

  } catch (error) {
    console.error('Error retrieving emails:', error);
    return NextResponse.json({ error: 'Failed to retrieve emails' }, { status: 500 });
  }
}

// Helper function to list emails for a given label with pagination
async function listEmails(gmail: gmail_v1.Gmail, label: string, pageToken: string) {
  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      labelIds: [label],
      pageToken: pageToken || undefined, // Include the pageToken for pagination
      maxResults: 10, // Fetch a maximum of 10 emails per request (adjustable)
    });

    const messages = res.data.messages || [];
    const emails = [];

    for (const message of messages) {
      // Ensure message.id is valid before proceeding
      if (!message.id) {
        continue; // Skip invalid messages
      }

      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      });

      // Check if payload and headers are defined
      const payload = msg.data.payload;
      if (!payload || !payload.headers) {
        continue; // Skip if there's no payload or headers
      }

      // Retrieve email headers (subject, from, date)
      const subjectHeader = payload.headers.find(
        (header) => header.name === "Subject"
      );
      const fromHeader = payload.headers.find(
        (header) => header.name === "From"
      );
      const dateHeader = payload.headers.find(
        (header) => header.name === "Date"
      );

      const subject = subjectHeader ? subjectHeader.value : "No Subject";
      const from = fromHeader ? fromHeader.value : "Unknown Sender";

      // Safely handle the date header, ensuring it's a valid value before passing to Date
      const date = dateHeader && dateHeader.value
        ? new Date(dateHeader.value).toLocaleString()
        : "Unknown Date"; // Fallback to "Unknown Date" if invalid
        const isRead = !(msg.data.labelIds?.includes("UNREAD"));
      emails.push({
        id: message.id,
        subject,
        from,
        date,
        snippet: msg.data.snippet || "No snippet available", // Add email snippet if available
        isRead
      });
    }
   console.log(emails)
    // Return the emails and nextPageToken if available
    return {
      emails: emails,
      nextPageToken: res.data.nextPageToken || null,
    };
  } catch (error) {
    console.error(`Error fetching emails from ${label}:`, error);
    return { emails: [], nextPageToken: null };
  }
}

