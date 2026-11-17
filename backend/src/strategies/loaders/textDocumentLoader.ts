import { IDocumentLoader } from "../../interfaces/documentLoader.interface.js";

export class TextDocumentLoader implements IDocumentLoader {
  public supports(filename: string): boolean {
    return filename.toLowerCase().endsWith(".txt");
  }

  public async load(buffer: Buffer, _filename: string): Promise<string> {
    return buffer.toString("utf-8");
  }
}
