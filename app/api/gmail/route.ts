
  import { NextRequest, NextResponse } from "next/server";
  import { gmail_v1, google } from "googleapis";
  import oauth2Client, { verifyAndRefreshToken } from "../../lib/google-oauth";
  import { Mistral } from "@mistralai/mistralai";
  import { convert } from "html-to-text";
const apiKey = process.env.MISTRAL_API_KEY;
const modelName="ministral-8b-latest"
const mistral = new Mistral({apiKey: apiKey});


interface Command {
  command: "retrieve" | "read" | "send" | "reply" | "delete" | "archive" | "mark_read" | "mark_unread" | "get_starred" | "ai_process";
  params: Record<string, any>;
}

interface Attachment {
  filename: string;
  mimeType: string;
  url: string;
}

interface ResponseMetadata {
  tone: string;
  summary: string;
}

interface ChatResponse {
  
      
        
              message: string; // AI-generated reply content
         
          metadata: ResponseMetadata;
          attachments: Attachment[];
     
  
}
type AIResponseCommand = Command[]; // The AI should always return an array of commands

  export async function POST(req: NextRequest) {
    const tokenData = await verifyAndRefreshToken();
    if (tokenData.error) {
        return NextResponse.json({ error: tokenData.error }, { status: tokenData.status });
    }
    oauth2Client.setCredentials({ access_token: tokenData.accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  
    const body = await req.json();
    const { userCommand } = body;
  
    try {
      const parsedActions = await aiCommandMap(userCommand);
      const results = await executeCommands(parsedActions, gmail);
     // const aifeedback=await aiProcessEmail(`${results}`)
      return NextResponse.json({ message: "Commands executed successfully.", results });
    } catch (error: any) {
      return NextResponse.json({ error: "Failed to process command.", details: error.message }, { status: 500 });
    }
  }
  
  // AI Maps User Input to Commands using Groq
  const aiCommandMap = async (userInput: string) => {
    const prompt = `
      Only give the json array no other text because I going to give your answer to a function
      Map the following user input to one or more actions, and always return the result as an array of commands.
      The only valid commands are: 
      "retrieve", "process", "send", "reply", "delete", "archive", "mark_read", "mark_unread".
      
      Examples:
  
      1. "Show me unread emails" → [{ "command": "retrieve", "params": { "query": "is:unread" } }]
      2. "Send an email to john@example.com with subject 'Meeting' and message 'Let's discuss tomorrow'" 
         → data:[{ "command": "send", "params": { "to": "john@example.com", "subject": "Meeting", "message": "Let's discuss tomorrow" } }]
      3. "Mark all emails from yesterday as read" 
         → data:[
              { "command": "retrieve", "params": { "query": "after:yesterday" } }, 
              { "command": "mark_read", "params": { "emailId": "<emailId>" } }
            ]
      4. "Reply to email with ID 98765 with message 'Got it!'" 
         →data: [{ "command": "reply", "params": { "emailId": "98765", "message": "Got it!" } }]
      5. "Delete the email with ID 56789" 
         → data:[{ "command": "delete", "params": { "emailId": "56789" } }]
      6. "Archive the email with ID 12345" 
         → data:[{ "command": "archive", "params": { "emailId": "12345" } }]
      7. "Mark the email with ID 67890 as unread" 
         → data:[{ "command": "mark_unread", "params": { "emailId": "67890" } }]
      8. "Show all emails with subject 'Invoice'" 
          → data:[{ "command": "retrieve", "params": { "query": "subject:Invoice" } }]
      9. "Reply to email ID 23456 with message 'Thanks for the update!'" 
          → data:[{ "command": "reply", "params": { "emailId": "23456", "message": "Thanks for the update!" } }]
      10. "Delete all emails from 'spam@example.com'" 
          →data:[
              { "command": "retrieve", "params": { "query": "from:spam@example.com" } },
              { "command": "delete", "params": { "emailId": "<emailId>" } }
            ]
      11. "Can you process and tell me what is this email about email ID 23456" 
          → data:[{ "command": "process", "params": { "emailId": "23456"} }]
      
      User Input: "${userInput}"
  
      Please map this user input to a corresponding action(s) and return the result as an array of commands using only the valid commands listed above I do not want explanation just give the array.
    `;
  
    const chatResponse = await mistral.chat.complete({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      responseFormat: { type: "json_object" },
    });
  
    // Ensure content is always treated as a string
    const content = chatResponse?.choices?.[0]?.message?.content;
    console.log(content,chatResponse)
    if (Array.isArray(content)) {
      console.error("Expected string but received array:", content);
      return [];
    }
  
    try {
      return JSON.parse(content ?? "[]"); // Ensure safe parsing
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return [];
    }
      
  };
  
  // Execute Commands Based on AI Processing
  // Execute Commands Based on AI Processing
  const executeCommands = async (actions: AIResponseCommand, gmail: any) => {
    const results: { command: string; result?: any; error?: string }[] = [];
  
    console.log("Executing actions:", actions);
  
    for (const action of actions) {
      const { command, params } = action;
      if (commandMap[command]) {
        try {
          const result = await commandMap[command](params, gmail);
          results.push({ command, result });
        } catch (error: any) {
          results.push({ command, error: error.message || "Execution failed" });
        }
      } else {
        results.push({ command, error: "Unknown command" });
      }
    }
  
    console.log("Execution results:", results);
    return results;
  };
  
  
  
  // Command Map
  const commandMap: Record<string, (params: any, gmail: any) => Promise<any>> = {
    retrieve: async ({ query }, gmail) => getEmails(query ?? "", gmail),
    process: async ({ emailId }, gmail) => getEmailDetails(emailId ?? "", gmail),
    send: async ({ to, subject, message }, gmail) => sendEmail(to ?? "", subject ?? "", message ?? "", gmail),
    reply: async ({ emailId, message }, gmail) => replyToEmail(emailId ?? "", message ?? "", gmail),
    delete: async ({ emailId }, gmail) => deleteEmail(emailId ?? "", gmail),
    archive: async ({ emailId }, gmail) => archiveEmail(emailId ?? "", gmail),
    mark_read: async ({ emailId }, gmail) => markEmailAsRead(emailId ?? "", gmail),
    mark_unread: async ({ emailId }, gmail) => markEmailAsUnread(emailId ?? "", gmail),
  };
  
 // AI Email Processing with Groq
async function aiProcessEmail(content: string) {
  const chatResponse = await mistral.chat.complete({
    model: modelName,
    messages: [
      { role: "user", content: content }
    ],
   
  });
  
    return chatResponse?.choices?.[0].message.content;
  }
  
  async function summarizeData(groupedLLData: any) {
    try {
      const prompt = `Please summarize the following email thread data:\n\n${groupedLLData.join("\n")}`;
  
      // Assuming aiProcessEmail function sends data to the AI model for summarization
      const summary = await aiProcessEmail(prompt); 
  
      return summary;
    } catch (error) {
      console.error("Error summarizing data:", error);
      return "Failed to summarize the data.";
    }
  }

  async function getEmails(query: string, gmail: gmail_v1.Gmail) {
    try {
      const res = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: 10, // Fetch max 10 emails
      });
  
      // Ensure `res.data.messages` exists before using it
      const messages = res.data?.messages || [];
      if (messages.length === 0) {
        console.warn(`No emails found for query: "${query}"`);
        return [];
      }
  
      const emails = [];
  
      for (const message of messages) {
        if (!message.id) continue; // Skip invalid messages
  
        const msg = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });
  
        if (!msg.data.payload?.headers) continue; // Skip if no headers
  
        // Extract email metadata
        const headers = msg.data.payload.headers;
        const subject = headers.find((h) => h.name === "Subject")?.value || "No Subject";
        const from = headers.find((h) => h.name === "From")?.value || "Unknown Sender";
        const date = headers.find((h) => h.name === "Date")?.value || "Unknown Date";
        const isRead = !(msg.data.labelIds?.includes("UNREAD"));
  
        emails.push({
          id: message.id,
          subject,
          from,
          date: new Date(date).toLocaleString(),
          snippet: msg.data.snippet || "No snippet available",
          isRead,
        });
      }
  
      return emails;
    } catch (error: any) {
      console.error(`Error fetching emails: ${error.message}`, error);
      return [];
    }
  }
  



  export async function getEmailDetails(id: string, gmail: any) {
    try {
      const message = await gmail.users.messages.get({ userId: "me", id: id });
      const threadId = message.data.threadId;
  
      if (!threadId) {
        return { error: "No thread found" }; // Ensure consistent error object
      }
  
      const thread = await gmail.users.threads.get({ userId: "me", id: threadId });
      const messages = thread.data.messages || [];
  
      const structuredThread = messages.map((msg: any) => {
        const headers = msg.payload?.headers || [];
        const subject = headers.find((h: any) => h.name === "Subject")?.value || "(No Subject)";
        const from = headers.find((h: any) => h.name === "From")?.value || "Unknown Sender";
        const to = headers.find((h: any) => h.name === "To")?.value || "Unknown Recipient";
        const date = headers.find((h: any) => h.name === "Date")?.value || "Unknown Date";
  
        const extractedData = extractMessageParts(msg.payload?.parts || []);
        let emailBody = extractedData.html || extractedData.text || "No content available";
  
        extractedData.images.forEach((img: any) => {
          emailBody = emailBody.replace(
            new RegExp(`cid:${img.cid}`, "g"),
            `/api/attachment?messageId=${msg.id}&attachmentId=${img.attachmentId}`
          );
        });
  
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
          images: extractedData.images || [],
        };
  
        return {
          data: JSON.stringify(llmData),
        };
      });
      const groupedLLData = structuredThread.map((email: any) => {
        // Ensure that each email's 'data' is a string. If it's an object, convert it to a string.
        return typeof email.data === 'string' ? email.data : JSON.stringify(email.data);
      });
      
     
      console.log(message.data.payload.headers)
      const summarizedData = await summarizeData(groupedLLData);
     
      
    
     
      return {
        data: summarizedData,
        headers: message.data.payload.headers, // Consistent return with headers
      };
    } catch (error) {
      console.error("Error fetching email details:", error);
      return { error: "Failed to fetch email details." }; // Return a consistent error object
    }
  }
  
  export async function sendEmail(to: string, subject: string, message: string, gmail: any) {
    const emailContent = `To: ${to}\nSubject: ${subject}\n\n${message}`;
    const encodedMessage = Buffer.from(emailContent).toString("base64");
    console.log(to,subject,message,gmail)
    try {
      await gmail.users.messages.send({ userId: "me", requestBody: { raw: encodedMessage } });
      return `Email successfully sent to ${to}.`;
    } catch (error) {
      console.error("Error sending email:", error);
      return "Failed to send email.";
    }
  }
  
  export async function replyToEmail(id: string, message: string, gmail: any) {
    try {
        // Fetch email details
        const emailDetails = await getEmailDetails(id, gmail);

        // Check if there was an error fetching the email details
        if (emailDetails.error) {
            return emailDetails.error; // Return the error message from getEmailDetails
        }

        // Generate a reply using the LLM (AI) model
        const chatResponse = await mistral.chat.complete({
          model: 'mistral-7B', // Replace with your model name
          messages: [
              {
                  role: "user",
                  content: `Please generate a response to the following email. The response should follow this JSON format:
                  {
                     
                          "message": "The content of the AI-generated response.",
                          "metadata": {
                              "tone": "friendly",
                              "summary": "A short summary of the reply or message."
                          },
                          "attachments": [
                              {
                                  "filename": "example.jpg",
                                  "mimeType": "image/jpeg",
                                  "url": "http://example.com/path/to/image.jpg"
                              }
                          ]
                     
                  }
      
                  Original Email:
                  ${emailDetails.data}`
              }
          ],
          responseFormat: { type: "json_object" }
      });
      
      // Parse the response content to an object first
      const content = chatResponse?.choices?.[0]?.message?.content;

      let parsedContent: string;
      
      if (typeof content === 'string') {
          parsedContent = content;  // It's already a string
      } else if (Array.isArray(content)) {
          parsedContent = content.join('');  // Convert the ContentChunk[] to a string by joining them
      } else {
          parsedContent = '';  // If it's neither, set it as an empty string or handle it as needed
      }
      
      const parsedResponse: ChatResponse = JSON.parse(parsedContent || '{}');

      
      // Extract AI-generated content from parsed response
      const aiGeneratedReply = parsedResponse?.message || "No reply generated.";
      const aiResponseMetadata = parsedResponse?.metadata;
      const aiAttachments = parsedResponse?.attachments;
      
        // Proceed with the reply if headers are available
        const headers: { name: string; value: string }[] = emailDetails.headers || [];
        const to = headers.find((header) => header.name === "From")?.value;
        const subject = headers.find((header) => header.name === "Subject")?.value || "";

        // If no recipient is found, return an error
        if (!to) return "Recipient not found.";

        // Create a reply subject, prepending 'Re:' if necessary
        const replySubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;

        // Format the full email content for the reply
        const emailContent = `To: ${to}\nSubject: ${replySubject}\nIn-Reply-To: ${id}\nReferences: ${id}\n\n${aiGeneratedReply}`;

        // Encode the email content in base64 format for Gmail API
        const encodedMessage = Buffer.from(emailContent).toString("base64");

        // Send the reply using the Gmail API
        await gmail.users.messages.send({
            userId: "me",
            requestBody: { raw: encodedMessage },
        });

        // Handle attachments if available
        if (aiAttachments && aiAttachments.length > 0) {
          for (const attachment of aiAttachments) {
              // Fetch the attachment from the URL
              const attachmentContent = await fetch(attachment.url)
                  .then(res => res.arrayBuffer());  // Use arrayBuffer() instead of buffer()
      
              // You would need logic here to upload and attach files using Gmail API
          }
      }
      

        // Handle metadata if needed
        if (aiResponseMetadata) {
            console.log('Metadata:', aiResponseMetadata);
            // You can handle or store metadata here (e.g., logging the tone/summary)
        }

        return `Reply successfully sent to ${to}.`;
    } catch (error) {
        console.error("Error replying to email:", error);
        return "Failed to send reply.";
    }
}

  
  
  export async function deleteEmail(id: string, gmail: any) {
    try {
      await gmail.users.messages.delete({ userId: "me", id });
      return "Email successfully deleted.";
    } catch (error) {
      console.error("Error deleting email:", error);
      return "Failed to delete email.";
    }
  }
  
  export async function archiveEmail(id: string, gmail: any) {
    try {
      await gmail.users.messages.modify({ userId: "me", id, requestBody: { removeLabelIds: ["INBOX"] } });
      return "Email successfully archived.";
    } catch (error) {
      console.error("Error archiving email:", error);
      return "Failed to archive email.";
    }
  }
  
  export async function markEmailAsRead(id: string, gmail: any) {
    try {
      await gmail.users.messages.modify({ userId: "me", id, requestBody: { removeLabelIds: ["UNREAD"] } });
      return "Email marked as read.";
    } catch (error) {
      console.error("Error marking email as read:", error);
      return "Failed to mark email as read.";
    }
  }
  
  export async function markEmailAsUnread(id: string, gmail: any) {
    try {
      await gmail.users.messages.modify({ userId: "me", id, requestBody: { addLabelIds: ["UNREAD"] } });
      return "Email marked as unread.";
    } catch (error) {
      console.error("Error marking email as unread:", error);
      return "Failed to mark email as unread.";
    }
  }
  










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








