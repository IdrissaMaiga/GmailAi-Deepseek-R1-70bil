import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { TextEncoder } from "util"; // Import explicitly for Node.js environments

const groq = new Groq({
  apiKey: process.env["AI_API_KEY"] || "",
});

const modelName = "deepseek-r1-distill-llama-70b";

if (!groq.apiKey) {
  throw new Error("Missing AI_API_KEY environment variable");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userCommand } = body;

  const prompt = `
    You are an assistant with detailed knowledge of Idrissa Maiga:
    - Background: Junior Java Engineer, Software Developer, born in Bamako, Mali
    - Experience: 5+ years in Java, Spring Boot, RESTful APIs, MySQL, PostgreSQL, AWS, Node.js, React.js, and .NET Core
    - Education: Obuda University, Budapest (BSc in Computer Science, GPA: 8.7, Expected 2027)
    - Languages: English, French, Hungarian (beginner), Bambara
    - Certifications: Spring Boot, Full-Stack Web Development, ASP.NET Core, Cisco Networking
    - Projects: Filmu (VOD Streaming), Gmail AI Assistance, SignalApp (Trading Signals), Kouma (AI Chat App)
    - Hobbies: AI development, cloud technologies, football, continuous learning, technology-driven solutions
    - Interests: Cloud platforms (AWS, Google Cloud), DevOps practices, Docker, Kubernetes

    User Input: "${userCommand}"
    Provide a helpful AI response based on Idrissa Maiga.
  `;

  // Step 1: Get the full AI response
  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are an AI assistant with expertise in Java, Spring Boot, and AI projects." },
      { role: "user", content: prompt },
    ],
    model: modelName,
    temperature: 0.6,
    max_completion_tokens: 4096,
    top_p: 0.95,
    stream: false, // Get full response first
  });

  let fullResponse = response.choices?.[0]?.message?.content || "";

  console.log("Full AI Response:", fullResponse); // Debugging

  // Step 2: Remove the <think> section
  fullResponse = fullResponse.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  console.log("Cleaned AI Response:", fullResponse); // Debugging

  // Step 3: Send the cleaned response in chunks
  const encoder = new TextEncoder();
  const CHUNK_SIZE = 100; // Customize chunk size as needed

  const stream = new ReadableStream({
    start(controller) {
      let index = 0;

      function sendNextChunk() {
        if (index < fullResponse.length) {
          const chunk = fullResponse.slice(index, index + CHUNK_SIZE);
          controller.enqueue(encoder.encode(chunk));
          index += CHUNK_SIZE;
          setTimeout(sendNextChunk, 10); // Delay to simulate streaming
        } else {
          controller.close();
        }
      }

      sendNextChunk();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain" },
  });
}
