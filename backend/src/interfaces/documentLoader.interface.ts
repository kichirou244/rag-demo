export interface IDocumentLoader {
  load(buffer: Buffer, filename: string): Promise<string>;
  supports(filename: string): boolean;
}
