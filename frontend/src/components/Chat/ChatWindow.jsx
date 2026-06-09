import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Spin, Modal, Typography } from "antd";
import { SendOutlined, DeleteOutlined, RobotOutlined, ThunderboltOutlined } from "@ant-design/icons";
import ChatMessage from "./ChatMessage";

const { Text } = Typography;

const SUGGESTIONS = [
  "Today's stats",
  "Pending orders",
  "Overdue deliveries",
  "Revenue by source",
];

const TypingIndicator = () => (
  <div className="flex gap-2.5 mb-5">
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs"
      style={{ background: "linear-gradient(135deg, #492E87, #7C3AED)" }}
    >
      <RobotOutlined />
    </div>
    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 shadow-sm flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  </div>
);

const WelcomeScreen = ({ onSend }) => (
  <div className="flex flex-col items-center justify-center h-full px-6 pb-6">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
      style={{ background: "linear-gradient(135deg, #492E87 0%, #7C3AED 100%)" }}
    >
      <ThunderboltOutlined className="text-white text-2xl" />
    </div>
    <Text strong className="text-base mb-1 text-slate-800 dark:text-slate-100">
      Hi, I&apos;m Jarvis
    </Text>
    <Text className="text-gray-400 dark:text-gray-500 text-xs text-center mb-6 leading-relaxed">
      Your AI assistant for Elegant Tex.<br />Ask me anything about orders, customers, or stats.
    </Text>
    <div className="flex flex-wrap gap-2 justify-center w-full">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          onClick={() => onSend(s)}
          className="px-3.5 py-2 rounded-xl text-xs font-medium border border-purple-100 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:border-purple-300 transition-colors"
        >
          {s}
        </button>
      ))}
    </div>
  </div>
);

const ChatWindow = ({ messages, loading, historyLoading, error, onSend, onClear }) => {
  const [input, setInput] = useState("");
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const confirmClear = () => {
    Modal.confirm({
      title: "Clear conversation?",
      content: "This will clear messages from your screen. Your history is saved and will reload next time.",
      okText: "Clear",
      okType: "danger",
      cancelText: "Cancel",
      onOk: onClear,
    });
  };

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #492E87 0%, #6B46C1 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <ThunderboltOutlined className="text-white text-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm leading-tight">Jarvis</span>
            <span className="text-purple-200 text-xs leading-tight">AI Assistant</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/80 text-xs">Online</span>
          </div>
          {messages.length > 0 && (
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={confirmClear}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
            />
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 bg-gray-50 dark:bg-slate-900">
        {historyLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Spin size="small" />
            <span className="text-gray-400 text-xs">Loading history…</span>
          </div>
        ) : isEmpty ? (
          <WelcomeScreen onSend={onSend} />
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {loading && <TypingIndicator />}
            {error && (
              <div className="flex items-start gap-2 text-red-600 text-xs mb-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 px-3 py-2.5 rounded-xl">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Persistent quick-action chips */}
      {!isEmpty && !historyLoading && (
        <div className="px-3 pt-2.5 pb-0 flex gap-1.5 overflow-x-auto bg-gray-50 dark:bg-slate-900"
             style={{ scrollbarWidth: "none" }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSend(s)}
              disabled={loading}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-purple-100 dark:border-purple-900 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 disabled:opacity-40 transition-colors shadow-sm"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="px-3 py-3 bg-gray-50 dark:bg-slate-900">
        <div className="flex items-end gap-0 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm overflow-hidden focus-within:border-purple-400 dark:focus-within:border-purple-500 focus-within:shadow-md transition-all">
          <Input.TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything…"
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={loading}
            maxLength={1000}
            variant="borderless"
            className="flex-1 text-sm px-4 py-3 resize-none bg-transparent"
          />
          <div className="px-2 pb-2 flex-shrink-0 self-end">
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #492E87, #7C3AED)"
                  : "#e5e7eb",
              }}
            >
              {loading
                ? <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                : <SendOutlined className={input.trim() ? "text-white text-xs" : "text-gray-400 text-xs"} />
              }
            </button>
          </div>
        </div>
        {input.length > 800 && (
          <div className="text-right mt-1 pr-1">
            <span className="text-xs text-gray-400">{input.length}/1000</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
