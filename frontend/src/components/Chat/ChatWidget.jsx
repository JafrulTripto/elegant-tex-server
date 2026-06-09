import React, { useState, useCallback, useRef } from "react";
import { Button } from "antd";
import { MessageOutlined, CloseOutlined } from "@ant-design/icons";
import ChatWindow from "./ChatWindow";
import useChat from "../../hooks/useChat";

const ChatWidget = () => {
  // `mounted` controls DOM presence; `open` drives the CSS transition.
  // Separating them lets the exit animation complete before unmounting.
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const { messages, loading, historyLoading, error, sendMessage, clearChat } = useChat();

  const toggle = useCallback(() => {
    clearTimeout(timerRef.current);

    if (!mounted) {
      // Mount first, then trigger enter animation on next frame
      setMounted(true);
      timerRef.current = setTimeout(() => setOpen(true), 10);
    } else {
      // Start exit animation, then unmount once it finishes
      setOpen(false);
      timerRef.current = setTimeout(() => setMounted(false), 260);
    }
  }, [mounted]);

  return (
    <>
      {/* Floating action button */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={open ? <CloseOutlined /> : <MessageOutlined />}
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 transition-all hover:scale-110"
        style={{
          width: 56,
          height: 56,
          background: "linear-gradient(135deg, #492E87, #7C3AED)",
          border: "none",
          boxShadow: "0 8px 24px rgba(73, 46, 135, 0.45)",
        }}
      />

      {/* Chat panel — slide-up + spring scale from bottom-right */}
      {mounted && (
        <div
          className="fixed bottom-24 right-6 z-50 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700"
          style={{
            width: 380,
            height: "min(560px, calc(100vh - 120px))",
            boxShadow: "0 24px 64px rgba(73, 46, 135, 0.18), 0 8px 24px rgba(0,0,0,0.12)",
            transformOrigin: "bottom right",
            transform: open ? "scale(1) translateY(0)" : "scale(0.92) translateY(16px)",
            opacity: open ? 1 : 0,
            transition: "transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 220ms ease",
          }}
        >
          <ChatWindow
            messages={messages}
            loading={loading}
            historyLoading={historyLoading}
            error={error}
            onSend={sendMessage}
            onClear={clearChat}
          />
        </div>
      )}
    </>
  );
};

export default ChatWidget;
