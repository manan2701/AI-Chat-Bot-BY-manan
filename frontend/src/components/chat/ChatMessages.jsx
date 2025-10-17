import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./ChatMessages.css";

const ChatMessages = ({ messages, isSending }) => {
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isSending]);

  return (
    <div className="messages" aria-live="polite">
      {messages.map((m, index) => (
        <div key={index} className={`msg msg-${m.type}`}>
          <div className="msg-role" aria-hidden="true">
            {m.type === "user" ? "You" : "AI"}
          </div>
          <div className="msg-bubble">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
          </div>
          <div className="msg-actions" role="group" aria-label="Message actions">
            <button
              type="button"
              aria-label="Copy message"
              onClick={() => navigator.clipboard.writeText(m.content)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {isSending && (
        <div className="msg msg-ai pending">
          <div className="msg-role" aria-hidden="true">
            AI
          </div>
          <div className="msg-bubble typing-dots" aria-label="AI is typing">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
