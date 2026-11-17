import { IDocumentLoader } from "../../interfaces/documentLoader.interface.js";

export class MarkdownDocumentLoader implements IDocumentLoader {
  public supports(filename: string): boolean {
    const lower = filename.toLowerCase();
    return lower.endsWith(".md") || lower.endsWith(".markdown");
  }

  public async load(buffer: Buffer, _filename: string): Promise<string> {
    return buffer.toString("utf-8").replace(/\r\n/g, "\n");
  }
}
