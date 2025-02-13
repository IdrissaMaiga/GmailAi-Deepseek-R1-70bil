"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaRobot, FaTimes } from "react-icons/fa";

interface Message {
  text: string;
  sender: "User" | "AI";
}

const ChatButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const savedMessages = localStorage.getItem("chatMessages");
      return savedMessages ? JSON.parse(savedMessages) : [{ text: "Hello! How can I assist you today?", sender: "AI" }];
    }
    return [{ text: "Hello! How can I assist you today?", sender: "AI" }];
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => setIsChatOpen((prev) => !prev);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessages: Message[] = [...messages, { text: userMessage, sender: "User" }];
    setMessages(newMessages);
    setUserMessage("");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCommand: userMessage }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiMessage = "";

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          aiMessage += decoder.decode(value, { stream: true });
          setMessages([...newMessages, { text: aiMessage, sender: "AI" }]);
        }
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition z-50"
      >
        <FaRobot size={30} />
      </button>

      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[400px] bg-gray-900 text-white rounded-lg shadow-xl flex flex-col z-50">
          <div className="flex justify-between items-center p-3 bg-gray-800 rounded-t-lg">
            <span className="font-semibold">Chat</span>
            <button onClick={toggleChat} className="text-white hover:text-red-500">
              <FaTimes size={20} />
            </button>
          </div>
          <div
            className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700"
            style={{ maxHeight: "85%", scrollbarWidth: "thin", scrollbarColor: "#3b82f6 #374151" }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg ${
                  message.sender === "AI" ? "bg-blue-600 text-white" : "bg-green-600 text-white"
                }`}
              >
                <strong>{message.sender}:</strong> {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-700 flex">
            <textarea
              value={userMessage}
              onChange={handleInputChange}
              className="flex-1 p-2 bg-gray-800 text-white rounded-lg resize-none outline-none"
              placeholder="Ask me anything..."
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatButton;
