import React, { useState } from "react";
import { ChevronDown, ChevronRight, FileText, Hash, Layers } from "lucide-react";
import { Citation } from "../../types/chat.js";
import { Badge } from "../common/Badge.js";

export interface CitationsAccordionProps {
  sources: Citation[];
}

export const CitationsAccordion: React.FC<CitationsAccordionProps> = ({
  sources,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!sources || sources.length === 0) {
    return null;
  }

  const toggleSourceDetail = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="mt-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 overflow-hidden text-xs">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Căn cứ pháp lý trích dẫn</span>
          <Badge variant="brand" size="sm">
            {sources.length} trích đoạn đối chiếu
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <span>{isOpen ? "Thu gọn" : "Xem chi tiết"}</span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 space-y-2 border-t border-slate-200 dark:border-slate-800">
          {sources.map((source, index) => {
            const isItemExpanded = expandedIndex === index;
            const filename =
              (source.metadata?.filename as string) ||
              source.documentId.slice(0, 8);
            const strategy = source.metadata?.strategy as string | undefined;
            const scorePercent = (source.score * 100).toFixed(1);
            const hierarchy = source.metadata?.hierarchy as string[] | undefined;

            return (
              <div
                key={source.id || index}
                className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950/60 overflow-hidden"
              >
                <div
                  onClick={() => toggleSourceDetail(index)}
                  className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      [Trích đoạn {index + 1}] {filename}
                    </span>
                    {strategy && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 uppercase font-mono">
                        {strategy}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={source.score >= 0.7 ? "success" : "info"} size="sm">
                      {scorePercent}% phù hợp
                    </Badge>
                    {isItemExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </div>

                {hierarchy && hierarchy.length > 0 && (
                  <div className="px-3 py-1 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-900 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Hash className="w-3 h-3 text-brand-500" />
                    <span>{hierarchy.join(" > ")}</span>
                  </div>
                )}

                {isItemExpanded && (
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed select-text">
                      {source.text}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Mã đoạn: {source.id}</span>
                      <span>Độ tương đồng: {source.score.toFixed(4)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};