import React, { useState } from "react";
import { CopyOutlined, CheckOutlined, UserOutlined, RobotOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const UserAvatar = () => (
  <div
    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs"
    style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
  >
    <UserOutlined />
  </div>
);

const BotAvatar = () => (
  <div
    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs"
    style={{ background: "linear-gradient(135deg, #492E87, #7C3AED)" }}
  >
    <RobotOutlined />
  </div>
);

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-2.5 mb-5 ${isUser ? "flex-row-reverse" : ""}`}
      style={{ animation: "fadeSlideIn 0.2s ease-out" }}
    >
      {isUser ? <UserAvatar /> : <BotAvatar />}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[82%]`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative group ${
            isUser
              ? "rounded-tr-sm text-purple-900 dark:text-purple-100"
              : "rounded-tl-sm bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 text-slate-800 dark:text-slate-200 shadow-sm"
          }`}
          style={isUser ? {
            background: "var(--user-bubble-bg, #EDE9FE)",
            border: "1px solid var(--user-bubble-border, #DDD6FE)",
          } : {}}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2">
                      <table className="w-full text-xs border-collapse">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="border-b-2 border-purple-100 dark:border-slate-500">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="text-left py-1.5 pr-4 font-semibold text-purple-700 dark:text-purple-300">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="py-1.5 pr-4 border-b border-gray-100 dark:border-gray-600">{children}</td>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-xs font-mono overflow-x-auto my-2 border border-slate-200 dark:border-slate-600">
                      {children}
                    </pre>
                  ),
                  code: ({ children, className }) =>
                    className ? (
                      <code className={className}>{children}</code>
                    ) : (
                      <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-purple-700 dark:text-purple-300">
                        {children}
                      </code>
                    ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-0.5 my-1.5">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-0.5 my-1.5">{children}</ol>
                  ),
                  p: ({ children }) => <p className="my-1 last:mb-0">{children}</p>,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>
                  ),
                  h1: ({ children }) => <h1 className="text-base font-bold mt-2 mb-1">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-1">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mt-1.5 mb-1">{children}</h3>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Copy button for assistant messages */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-1 ml-1 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
            style={{ animation: "none" }}
          >
            {copied ? (
              <><CheckOutlined className="text-green-500" /><span className="text-green-500">Copied</span></>
            ) : (
              <><CopyOutlined /><span>Copy</span></>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
