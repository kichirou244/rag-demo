import { v4 as uuidv4 } from "uuid";
import {
  ChunkingOptions,
  DocumentChunk,
  IChunkingStrategy,
} from "../../interfaces/chunkingStrategy.interface.js";

interface HeaderHierarchy {
  h1?: string;
  h2?: string;
  h3?: string;
  h4?: string;
  h5?: string;
  h6?: string;
}

export class MarkdownHeaderChunkingStrategy implements IChunkingStrategy {
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;

  constructor(options: ChunkingOptions) {
    this.chunkSize = Math.max(1, options.chunkSize);
    this.chunkOverlap = Math.max(0, Math.min(options.chunkOverlap, this.chunkSize - 1));
  }

  public getStrategyName(): string {
    return "markdown";
  }

  public chunk(text: string, metadata?: Record<string, unknown>): DocumentChunk[] {
    const trimmed = text.trim();
    if (!trimmed) {
      return [];
    }

    const lines = trimmed.split(/\r?\n/);
    const sections: Array<{
      headers: HeaderHierarchy;
      hierarchy: string[];
      lines: string[];
    }> = [];

    let currentHierarchy: HeaderHierarchy = {};
    let currentLineBuffer: string[] = [];

    const headingRegex = /^(#{1,6})\s+(.+)$/;

    for (const line of lines) {
      const match = line.match(headingRegex);

      if (match) {
        if (currentLineBuffer.length > 0) {
          sections.push({
            headers: { ...currentHierarchy },
            hierarchy: this.buildHierarchyList(currentHierarchy),
            lines: [...currentLineBuffer],
          });
          currentLineBuffer = [];
        }

        const level = match[1].length;
        const title = match[2].trim();
        currentHierarchy = this.updateHierarchy(currentHierarchy, level, title);
        currentLineBuffer.push(line);
      } else {
        currentLineBuffer.push(line);
      }
    }

    if (currentLineBuffer.length > 0) {
      sections.push({
        headers: { ...currentHierarchy },
        hierarchy: this.buildHierarchyList(currentHierarchy),
        lines: [...currentLineBuffer],
      });
    }

    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;

    for (const section of sections) {
      const sectionText = section.lines.join("\n").trim();
      if (!sectionText) {
        continue;
      }

      if (sectionText.length <= this.chunkSize) {
        chunks.push({
          id: uuidv4(),
          content: sectionText,
          index: chunkIndex++,
          metadata: {
            ...metadata,
            strategy: this.getStrategyName(),
            headers: section.headers,
            hierarchy: section.hierarchy,
            length: sectionText.length,
          },
        });
      } else {
        const subChunks = this.splitSection(sectionText);
        for (const subText of subChunks) {
          chunks.push({
            id: uuidv4(),
            content: subText,
            index: chunkIndex++,
            metadata: {
              ...metadata,
              strategy: this.getStrategyName(),
              headers: section.headers,
              hierarchy: section.hierarchy,
              length: subText.length,
            },
          });
        }
      }
    }

    return chunks;
  }

  private updateHierarchy(
    current: HeaderHierarchy,
    level: number,
    title: string
  ): HeaderHierarchy {
    const updated: HeaderHierarchy = {};
    const key = `h${level}` as keyof HeaderHierarchy;

    for (let i = 1; i < level; i++) {
      const existingKey = `h${i}` as keyof HeaderHierarchy;
      if (current[existingKey]) {
        updated[existingKey] = current[existingKey];
      }
    }

    updated[key] = title;
    return updated;
  }

  private buildHierarchyList(headers: HeaderHierarchy): string[] {
    const result: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const key = `h${i}` as keyof HeaderHierarchy;
      if (headers[key]) {
        result.push(headers[key] as string);
      }
    }
    return result;
  }

  private splitSection(sectionText: string): string[] {
    const step = Math.max(1, this.chunkSize - this.chunkOverlap);
    const result: string[] = [];

    for (let start = 0; start < sectionText.length; start += step) {
      const end = Math.min(start + this.chunkSize, sectionText.length);
      const slice = sectionText.slice(start, end).trim();
      if (slice.length > 0) {
        result.push(slice);
      }
      if (end >= sectionText.length) {
        break;
      }
    }

    return result;
  }
}
