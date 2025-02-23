"use client";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io"; // Import back icon from react-icons

type Message = {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  images: { filename: string; mimeType: string; attachmentId: string; cid: string; Url: string }[];
  attachments: { filename: string; mimeType: string; attachmentId: string; Url: string }[];
};

type GmailThreadFetcherProps = {
  messageId: string;
  setMessageId: Function;
};

export default function GmailThreadFetcher({ messageId, setMessageId }: GmailThreadFetcherProps) {
  const [thread, setThread] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Add loading state

  useEffect(() => {
    const fetchThread = async () => {
      if (!messageId) return;

      setLoading(true); // Set loading to true when starting to fetch
      try {
        setError(null);
        const response = await fetch(`/api/email?messageId=${messageId}`);
        const data = await response.json();
        if (response.ok) {
          setThread(data.thread);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to fetch thread");
      } finally {
        setLoading(false); // Set loading to false once the fetch is complete (either success or failure)
      }
    };
    fetchThread();
  }, [messageId]);

  const handleGoBack = () => {
    setMessageId(null); // Set the messageId to null when "Go Back" is clicked
  };

  return (
    <div className="p-4 mx-auto pb-40">
      {/* Go Back Button */}
      <button
        onClick={handleGoBack}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <IoIosArrowBack className="mr-2" />
        Go Back
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* Show Loading indicator when loading */}
      {loading && <p className="text-blue-500 mt-2">Loading...</p>}

      {thread && !loading && (
        <div className="mt-4 border p-4 rounded bg-gray-50">
          {thread.map((msg) => (
            <div key={msg.id} className="mb-6 border-b pb-4">
              <h2 className="text-lg font-semibold">{msg.subject}</h2>
              <p className="text-gray-600">
                <strong>From:</strong> {msg.from} <br />
                <strong>To:</strong> {msg.to} <br />
                <strong>Date:</strong> {msg.date}
              </p>
              <div
                className="mt-2 border p-2 bg-white rounded shadow-md overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: msg.body }}
              />
              {msg.attachments.length > 0 && (
                <div className="mt-2">
                  <strong>Attachments:</strong>
                  <ul className="list-disc ml-4">
                    {msg.attachments.map((att) => (
                      <li key={att.attachmentId}>
                        <a
                          href={`/api/attachment?messageId=${msg.id}&attachmentId=${att.attachmentId}&mimeType=${att.mimeType}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {att.filename} ({att.mimeType})
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
