import React from "react";
import Markdown from "react-markdown";
import { AlertCircle, Bot, User } from "lucide-react";
import { ChatMessage } from "../../types/chat.js";
import { CitationsAccordion } from "./CitationsAccordion.js";

export interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`py-5 px-4 sm:px-6 transition-colors ${
        isUser
          ? "bg-transparent"
          : "bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/60"
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-3 sm:gap-4">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
            isUser
              ? "bg-slate-700 dark:bg-slate-600"
              : "bg-gradient-to-tr from-brand-600 to-sky-500 shadow-md shadow-brand-500/20"
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
              {isUser ? "Bạn" : "Trợ Lý Luật Giao Thông"}
            </span>
            <span className="text-[10px] text-slate-400">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {message.error && (
            <div className="mb-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
              <span>{message.error}</span>
            </div>
          )}

          <div className="prose prose-sm dark:prose-invert max-w-none break-words text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
            {message.content ? (
              <Markdown>{message.content}</Markdown>
            ) : message.isStreaming ? (
              <div className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-brand-50/70 dark:bg-brand-950/30 border border-brand-200/50 dark:border-brand-900/40 text-xs text-brand-700 dark:text-brand-300 w-fit">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                </div>
                <span className="font-medium">
                  Đang tra cứu cơ sở dữ liệu Nghị định & phân tích khung phạt...
                </span>
              </div>
            ) : null}

            {message.isStreaming && message.content && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-brand-600 dark:bg-brand-400 animate-pulse align-middle rounded-sm" />
            )}
          </div>

          {!isUser && message.sources && message.sources.length > 0 && (
            <CitationsAccordion sources={message.sources} />
          )}
        </div>
      </div>
    </div>
  );
};