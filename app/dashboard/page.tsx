"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react"; // Loading spinner
import GmailThreadFetcher from "../../components/gmail/email";
import AIChatInput from "@/components/gmail/chatBox";
import ResultsComponent from "@/components/gmail/results";

interface Email {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  isRead: boolean;
}

interface Emails {
  inbox: Email[];
  trash: Email[];
  sent: Email[];
  ai: Email[];
}

const EmailsPage = () => {
  const [emails, setEmails] = useState<Emails>({ inbox: [], trash: [], sent: [], ai: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<"inbox" | "trash" | "sent" | "ai">("inbox");
  const [prevPageTokens, setPrevPageTokens] = useState<string[]>([]);
  const [userCommand, setUserCommand] = useState("");
  const [messageId, setMessageId] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const fetchEmails = async (label: "inbox" | "trash" | "sent" | "ai", pageToken: string | null, isNext: boolean) => {
    if (label === "ai") return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/emails?label=${label}&pageToken=${pageToken || ""}`);
      const data = await response.json();

      if (response.ok) {
        setEmails((prev) => ({ ...prev, [label]: Array.isArray(data.emails) ? data.emails : [] }));

        if (isNext) {
          if (nextPageToken) {
            setPrevPageTokens((prev) => [...prev, nextPageToken]); // Store current nextPageToken before moving forward
          }
        } else {
          setPrevPageTokens((prev) => prev.slice(0, -1)); // Remove last token when going back
        }

        setNextPageToken(data.nextPageToken || null); // Update next page token
      } else {
        setError(data.error || "Failed to load emails");
      }
    } catch (err) {
      setError("Error fetching emails");
    } finally {
      setLoading(false);
    }
  };

  const handleCommandSubmit = async () => {
    setSelectedLabel("ai");
    setPrevPageTokens([]);
    setResults([])
    try {
      const res = await fetch("/api/gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCommand:messageId ? "This is the message id " + messageId + " " + userCommand : userCommand }),
      });
      const data = await res.json();

      if (data.results) {
        const retrieveResults = data.results.find((r: any) => r.command === "retrieve");
        if (retrieveResults && Array.isArray(retrieveResults.result)) {
          setEmails((prev) => ({ ...prev, ai: retrieveResults.result }));
        }
        setResults(data.results.filter((r: any) => r.command !== "retrieve"))
      }
      
    } catch (error) {
      console.error("Failed to execute command", error);
    }
  };

  useEffect(() => {
    fetchEmails(selectedLabel, null, true);
  }, [selectedLabel]);

  return (
    <div className="container mx-auto px-6 py-8 flex flex-col h-screen">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">📨 GMAIL AI Manager made by Idrissa</h1>

   {!messageId&&<div className="container mb-40 ">
      {/* Navigation Tabs */}
      <nav className="flex justify-center space-x-4 mb-4">
        {["inbox", "trash", "sent", "ai"].map((label) => (
          <button
            key={label}
            className={`px-5 py-2 rounded-lg font-semibold transition duration-300 ${
              selectedLabel === label ? "bg-blue-500 text-white" : "bg-gray-300 hover:bg-blue-400 hover:text-white"
            }`}
            onClick={() => {
              setSelectedLabel(label as any);
              setPrevPageTokens([]); // Reset previous tokens
              setNextPageToken(null); // Reset next page token
            }}
            disabled={loading}
          >
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </button>
        ))}
      </nav>

      {/* Email List Section (Scrollable) */}
      <section className="flex-1 container mb-40 overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">{selectedLabel.charAt(0).toUpperCase() + selectedLabel.slice(1)}</h2>

        {/* Pagination Buttons */}
        {selectedLabel !== "ai" && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => {
                if (prevPageTokens.length > 0) {
                  const prevToken = prevPageTokens[prevPageTokens.length - 1]; // Get last stored token
                  fetchEmails(selectedLabel, prevToken, false);
                }
              }}
              disabled={loading || prevPageTokens.length === 0}
              className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Go Back
            </button>

            {loading && <Loader2 className="animate-spin text-gray-600" />}

            <button
              onClick={() => {
                if (nextPageToken) {
                  fetchEmails(selectedLabel, nextPageToken, true);
                }
              }}
              disabled={loading || !nextPageToken}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Page
            </button>
          </div>
        )}

        {/* Emails List */}
        <div className="bg-white shadow-lg rounded-lg p-5 mt-4">
          <ul className="space-y-6">
            {emails[selectedLabel].length === 0 ? (
              <li className="text-center text-gray-500">No emails found</li>
            ) : (
              emails[selectedLabel].map((email) => (
                <motion.li
                  key={email.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border-b pb-4 transition duration-300 ${email.isRead ? "text-gray-700" : "font-bold text-black"} hover:border-b-2 hover:border-blue-500 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 active:bg-gray-200`}
                  onClick={()=>{setMessageId(email.id)}}
                >
                  <div className="flex justify-between">
                    <span className="text-lg">{email.subject}</span>
                    <span className="text-sm text-gray-500">{email.date}</span>
                  </div>
                  <p className="text-gray-600 mt-1">From: {email.from}</p>
                  <p className="text-sm text-gray-700 mt-2">{email.snippet}</p>
                </motion.li>
              ))
            )}
          </ul>
        </div>
      </section>
      </div>
      }
      {messageId&&<GmailThreadFetcher messageId={messageId} setMessageId={setMessageId}></GmailThreadFetcher>
      }
      {results.length>0&&<ResultsComponent results={results}></ResultsComponent>
      }

<AIChatInput
        userCommand={userCommand}
        setUserCommand={setUserCommand}
        handleCommandSubmit={handleCommandSubmit}
        loading={loading}
      />
    </div>
  );
};

export default EmailsPage;
