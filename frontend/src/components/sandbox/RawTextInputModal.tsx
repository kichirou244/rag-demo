import React, { useState } from "react";
import { Button } from "../common/Button.js";
import { Modal } from "../common/Modal.js";

export interface RawTextInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngest: (text: string, title: string) => Promise<unknown>;
  isIngesting: boolean;
}

export const RawTextInputModal: React.FC<RawTextInputModalProps> = ({
  isOpen,
  onClose,
  onIngest,
  isIngesting,
}) => {
  const [title, setTitle] = useState<string>("document-notes.md");
  const [text, setText] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      return;
    }
    const result = await onIngest(text, title.trim() || "document-notes.md");
    if (result) {
      setText("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Paste Raw Markdown or Text">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Document Identifier / Filename
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isIngesting}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g. system-architecture.md"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Raw Content
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isIngesting}
            rows={10}
            className="w-full p-3 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 custom-scrollbar"
            placeholder="Paste your markdown headers, paragraphs, or documentation here..."
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span>{text.length} characters</span>
            <span>{text.split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isIngesting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isIngesting}
            disabled={!text.trim()}
          >
            {isIngesting ? "Chunking & Upserting..." : "Ingest Document"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
