import React from "react";
import { Sliders, Cpu, HelpCircle } from "lucide-react";
import { ChunkingStrategyType, LLMProviderType } from "../../types/chat.js";

export interface ChunkingControlsProps {
  strategy: ChunkingStrategyType;
  onChangeStrategy: (strategy: ChunkingStrategyType) => void;
  chunkSize: number;
  onChangeChunkSize: (size: number) => void;
  chunkOverlap: number;
  onChangeChunkOverlap: (overlap: number) => void;
  topK: number;
  onChangeTopK: (topK: number) => void;
  provider: LLMProviderType;
  onChangeProvider: (provider: LLMProviderType) => void;
  disabled?: boolean;
}

const STRATEGY_DESCRIPTIONS: Record<ChunkingStrategyType, string> = {
  recursive: "Hierarchical separators (paragraphs, newlines, sentences, words)",
  markdown: "Splits structurally by Markdown headings (#, ##) and preserves hierarchy",
  fixed: "Strict character count with sliding overlap window",
  sentence: "Sentence boundaries grouped into sliding windows",
};

export const ChunkingControls: React.FC<ChunkingControlsProps> = ({
  strategy,
  onChangeStrategy,
  chunkSize,
  onChangeChunkSize,
  chunkOverlap,
  onChangeChunkOverlap,
  topK,
  onChangeTopK,
  provider,
  onChangeProvider,
  disabled = false,
}) => {
  return (
    <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
      <div>
        <label className="font-semibold block mb-1 text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-brand-500" />
            Chunking Strategy
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Strategy Pattern</span>
        </label>
        <select
          value={strategy}
          onChange={(e) => onChangeStrategy(e.target.value as ChunkingStrategyType)}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
        >
          <option value="recursive">Recursive Character (Recommended)</option>
          <option value="markdown">Markdown Heading Hierarchy</option>
          <option value="fixed">Fixed Size Window</option>
          <option value="sentence">Sentence Sliding Window</option>
        </select>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
          <HelpCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-400" />
          <span>{STRATEGY_DESCRIPTIONS[strategy]}</span>
        </p>
      </div>

      <div className="space-y-3 pt-1 border-t border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Chunk Size
            </span>
            <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold">
              {chunkSize} chars
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={chunkSize}
            onChange={(e) => onChangeChunkSize(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Chunk Overlap
            </span>
            <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold">
              {chunkOverlap} chars
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.min(500, chunkSize - 20)}
            step={10}
            value={chunkOverlap}
            onChange={(e) => onChangeChunkOverlap(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Retrieval Count (Top-K)
            </span>
            <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold">
              {topK} chunks
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={topK}
            onChange={(e) => onChangeTopK(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="font-semibold block mb-2 text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-500" />
            LLM Generation Provider
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Adapter Pattern</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeProvider("openrouter")}
            disabled={disabled}
            className={`px-3 py-2 rounded-lg border text-center font-medium transition-all ${
              provider === "openrouter"
                ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400"
            }`}
          >
            OpenRouter
          </button>
          <button
            type="button"
            onClick={() => onChangeProvider("gemini")}
            disabled={disabled}
            className={`px-3 py-2 rounded-lg border text-center font-medium transition-all ${
              provider === "gemini"
                ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400"
            }`}
          >
            Google Gemini
          </button>
        </div>
      </div>
    </div>
  );
};
