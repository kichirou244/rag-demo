import { useCallback, useRef, useState } from "react";
import { ChatStreamService } from "../services/chatStream.js";
import { ChatMessage, Citation } from "../types/chat.js";

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome-message",
  role: "assistant",
  content:
    "Xin chào! Tôi là Trợ lý AI chuyên tra cứu xử phạt vi phạm trật tự, an toàn giao thông đường bộ, căn cứ theo **Nghị định 168/2024/NĐ-CP** và **Nghị định 238/2026/NĐ-CP** của Chính phủ.\n\nBạn có thể hỏi tôi về mức phạt tiền, trừ điểm Giấy phép lái xe (GPLX), quy định nồng độ cồn, quá tốc độ, chở trẻ em trên ô tô, che biển số xe... cho bất kỳ loại phương tiện nào.",
  timestamp: new Date().toISOString(),
};

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [activeSources, setActiveSources] = useState<Citation[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isStreaming ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  }, []);

  const clearMessages = useCallback(() => {
    stopStreaming();
    setMessages([INITIAL_MESSAGE]);
    setActiveSources([]);
  }, [stopStreaming]);

  const sendMessage = useCallback(
    async (content: string, topK: number = 4, provider?: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) {
        return;
      }

      const userMessageId = `user-${Date.now()}`;
      const assistantMessageId = `assistant-${Date.now()}`;

      const userMessage: ChatMessage = {
        id: userMessageId,
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        isStreaming: true,
        sources: [],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);
      setActiveSources([]);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await ChatStreamService.stream({
          message: trimmed,
          topK,
          provider,
          signal: controller.signal,
          onSources: (sources) => {
            setActiveSources(sources);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, sources } : msg
              )
            );
          },
          onToken: (token) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + token }
                  : msg
              )
            );
          },
          onDone: () => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, isStreaming: false }
                  : msg
              )
            );
            setIsStreaming(false);
            abortControllerRef.current = null;
          },
          onError: (err) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content:
                        msg.content ||
                        "Rất tiếc, đã xảy ra lỗi trong quá trình xử lý câu trả lời từ máy chủ.",
                      error: err.message,
                      isStreaming: false,
                    }
                  : msg
              )
            );
            setIsStreaming(false);
            abortControllerRef.current = null;
          },
        });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định";
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content:
                    msg.content ||
                    "Không thể kết nối đến dịch vụ tra cứu luật giao thông. Vui lòng kiểm tra lại kết nối máy chủ.",
                  error: errorMsg,
                  isStreaming: false,
                }
              : msg
          )
        );
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [isStreaming]
  );

  return {
    messages,
    isStreaming,
    activeSources,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
};
