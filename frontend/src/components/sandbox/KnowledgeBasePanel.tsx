import React, { useState } from "react";
import { Check, ClipboardPaste, Clock, Database, FileText, Layers, X } from "lucide-react";
import { ChunkingStrategyType, LLMProviderType } from "../../types/chat.js";
import { IngestionResult } from "../../types/ingestion.js";
import { Badge } from "../common/Badge.js";
import { Button } from "../common/Button.js";
import { ChunkingControls } from "./ChunkingControls.js";
import { FileUploadZone } from "./FileUploadZone.js";
import { RawTextInputModal } from "./RawTextInputModal.js";

export interface KnowledgeBasePanelProps {
  isOpen: boolean;
  onClose: () => void;
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
  isIngesting: boolean;
  lastResult: IngestionResult | null;
  history: IngestionResult[];
  onUploadFile: (file: File) => Promise<unknown>;
  onIngestText: (text: string, title: string) => Promise<unknown>;
}

export const KnowledgeBasePanel: React.FC<KnowledgeBasePanelProps> = ({
  isOpen,
  onClose,
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
  isIngesting,
  lastResult,
  history,
  onUploadFile,
  onIngestText,
}) => {
  const [isRawModalOpen, setIsRawModalOpen] = useState<boolean>(false);

  return (
    <>
      <div
        className={`fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Knowledge Sandbox
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Document Ingestion
            </h3>
            <FileUploadZone
              onUpload={onUploadFile}
              isIngesting={isIngesting}
            />

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsRawModalOpen(true)}
              disabled={isIngesting}
              className="w-full text-xs"
            >
              <ClipboardPaste className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              <span>Paste Raw Markdown / Text</span>
            </Button>
          </section>

          <section className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Chunking & Retrieval Parameters
            </h3>
            <ChunkingControls
              strategy={strategy}
              onChangeStrategy={onChangeStrategy}
              chunkSize={chunkSize}
              onChangeChunkSize={onChangeChunkSize}
              chunkOverlap={chunkOverlap}
              onChangeChunkOverlap={onChangeChunkOverlap}
              topK={topK}
              onChangeTopK={onChangeTopK}
              provider={provider}
              onChangeProvider={onChangeProvider}
              disabled={isIngesting}
            />
          </section>

          {lastResult && (
            <section className="p-3.5 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-900 dark:text-brand-200 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Latest Ingestion
                </span>
                <Badge variant="success" size="sm">
                  {lastResult.chunkCount} Chunks
                </Badge>
              </div>
              <div className="text-[11px] space-y-1 text-slate-600 dark:text-slate-400 font-mono">
                <div className="truncate">
                  Doc: {lastResult.filename || lastResult.documentId.slice(0, 8)}
                </div>
                <div>Strategy: {lastResult.strategy}</div>
                <div>Window: {lastResult.chunkSize} / {lastResult.chunkOverlap} overlap</div>
              </div>
            </section>
          )}

          {history.length > 0 && (
            <section className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Ingested Documents</span>
                <span className="text-[10px] lowercase font-normal">
                  ({history.length} total)
                </span>
              </h3>
              <div className="space-y-2">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200 truncate">
                        <FileText className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                        <span className="truncate">
                          {item.filename || `Doc ${item.documentId.slice(0, 6)}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="uppercase">{item.strategy}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" /> {item.chunkCount} chunks
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <RawTextInputModal
        isOpen={isRawModalOpen}
        onClose={() => setIsRawModalOpen(false)}
        onIngest={onIngestText}
        isIngesting={isIngesting}
      />
    </>
  );
};
