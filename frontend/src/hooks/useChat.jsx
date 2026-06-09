import { useState, useCallback, useEffect } from "react";
import useAxiosClient from "../axios-client";

const useChat = () => {
  const axiosClient = useAxiosClient();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load persisted history from the server on first mount
  useEffect(() => {
    let cancelled = false;
    axiosClient
      .get("chat/history")
      .then((res) => {
        if (!cancelled) {
          setMessages(
            (res.data.messages ?? []).map((m, i) => ({
              ...m,
              id: `history-${i}`,
            })),
          );
        }
      })
      .catch(() => {
        // Non-fatal — start with an empty chat if history fetch fails
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || loading) return;

      const history = messages.map(({ role, content }) => ({ role, content }));
      const userMsgId = Date.now();

      setMessages((prev) => [
        ...prev,
        { role: "user", content: text, id: userMsgId },
      ]);
      setLoading(true);
      setError(null);

      try {
        const res = await axiosClient.post("chat/send", { message: text, history });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.data.reply,
            type: res.data.type || "general",
            id: Date.now() + 1,
          },
        ]);
      } catch (e) {
        setMessages((prev) => prev.filter((m) => m.id !== userMsgId));

        const msg =
          e?.response?.status === 504
            ? "Request timed out — the AI is taking too long. Please try again."
            : e?.response?.data?.message || e.message || "Failed to get response";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, axiosClient],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, historyLoading, error, sendMessage, clearChat };
};

export default useChat;
