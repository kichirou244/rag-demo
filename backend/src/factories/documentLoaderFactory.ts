import { IDocumentLoader } from "../interfaces/documentLoader.interface.js";
import { MarkdownDocumentLoader } from "../strategies/loaders/markdownDocumentLoader.js";
import { TextDocumentLoader } from "../strategies/loaders/textDocumentLoader.js";

export class DocumentLoaderFactory {
  private static readonly loaders: IDocumentLoader[] = [
    new MarkdownDocumentLoader(),
    new TextDocumentLoader(),
  ];

  public static getLoader(filename: string): IDocumentLoader {
    const matched = this.loaders.find((loader) => loader.supports(filename));
    if (!matched) {
      return new TextDocumentLoader();
    }
    return matched;
  }

  public static registerLoader(loader: IDocumentLoader): void {
    this.loaders.unshift(loader);
  }
}
