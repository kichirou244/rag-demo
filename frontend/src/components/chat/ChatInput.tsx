import React, { useState, useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "../common/Button.js";

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStopStreaming: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopStreaming,
  isStreaming,
  disabled = false,
}) => {
  const [input, setInput] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (isStreaming) {
      onStopStreaming();
      return;
    }
    const trimmed = input.trim();
    if (!trimmed || disabled) {
      return;
    }
    onSendMessage(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4">
      <div className="max-w-4xl mx-auto space-y-3">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 border border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-950 p-2 shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              isStreaming
                ? "Trợ lý đang phản hồi... Bấm Dừng nếu muốn ngắt dòng."
                : "Hỏi về mức phạt tiền, trừ điểm GPLX, nồng độ cồn, chở trẻ em, biển số... (Shift+Enter để xuống dòng)"
            }
            rows={1}
            className="flex-1 max-h-44 p-2 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none custom-scrollbar"
          />

          {isStreaming ? (
            <Button
              type="button"
              onClick={onStopStreaming}
              variant="danger"
              size="sm"
              className="rounded-xl h-10 px-3 flex-shrink-0"
              title="Dừng phản hồi"
            >
              <Square className="w-4 h-4 fill-current mr-1.5" />
              <span>Dừng</span>
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={disabled || !input.trim()}
              variant="primary"
              size="sm"
              className="rounded-xl h-10 w-10 p-0 flex-shrink-0"
              title="Gửi câu hỏi"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};