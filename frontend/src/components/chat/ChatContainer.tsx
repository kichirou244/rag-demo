import React, { useEffect, useRef } from "react";
import { ArrowRight, BookOpen, Compass, ShieldAlert, Sparkles } from "lucide-react";
import { ChatMessage } from "../../types/chat.js";
import { ChatInput } from "./ChatInput.js";
import { ChatMessageItem } from "./ChatMessageItem.js";

export interface ChatContainerProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (message: string) => void;
  onStopStreaming: () => void;
  onClearMessages: () => void;
}

const FEATURED_TOPICS = [
  {
    icon: ShieldAlert,
    title: "Nồng độ cồn",
    desc: "Mức phạt tiền & số điểm trừ GPLX theo từng bậc nồng độ khí thở / máu",
    query: "Nồng độ cồn khi lái xe ô tô và xe máy bị phạt tiền bao nhiêu và trừ mấy điểm GPLX?",
  },
  {
    icon: Compass,
    title: "Vượt đèn đỏ & tốc độ",
    desc: "Khung xử phạt hành vi không chấp hành đèn tín hiệu hoặc chạy quá tốc độ",
    query: "Lỗi vượt đèn đỏ đối với xe máy và ô tô bị phạt bao nhiêu tiền, có bị trừ điểm bằng lái không?",
  },
  {
    icon: BookOpen,
    title: "Chở trẻ em trên ô tô",
    desc: "Quy định bắt buộc về thiết bị an toàn và vị trí ngồi cho trẻ dưới 10 tuổi",
    query: "Quy định mới về chở trẻ em dưới 10 tuổi trên xe ô tô áp dụng từ năm nào và mức phạt ra sao?",
  },
  {
    icon: Sparkles,
    title: "Che dán biển số & Điểm GPLX",
    desc: "Xử phạt hành vi bẻ cong, che mờ biển số và quy định khi bị trừ hết 12 điểm",
    query: "Hành vi che dán biển số xe phạt bao nhiêu? Khi bị trừ hết 12 điểm bằng lái thì phải làm gì?",
  },
];

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isStreaming,
  onSendMessage,
  onStopStreaming,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const hasOnlyWelcome = messages.length <= 1;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))}

        {hasOnlyWelcome && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <div className="mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Chủ đề tra cứu phổ biến
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURED_TOPICS.map((topic, index) => {
                const IconComponent = topic.icon;
                return (
                  <button
                    key={index}
                    onClick={() => onSendMessage(topic.query)}
                    disabled={isStreaming}
                    className="flex flex-col text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-brand-500/50 hover:shadow-sm transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {topic.title}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {topic.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSendMessage={onSendMessage}
        onStopStreaming={onStopStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
};