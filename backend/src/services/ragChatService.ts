import { config } from "../config/environment.js";
import { LLMProviderFactory } from "../factories/llmProviderFactory.js";
import { IEmbeddingProvider } from "../interfaces/embeddingProvider.interface.js";
import {
  IVectorRepository,
  SearchResult,
} from "../interfaces/vectorRepository.interface.js";
import { PromptBuilder } from "../utils/promptBuilder.js";
import { QueryRouterService } from "./queryRouterService.js";

export class RAGChatService {
  constructor(
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly vectorRepository: IVectorRepository
  ) {}

  public async streamChat(
    query: string,
    topK: number = 5,
    providerOverride: string | undefined,
    onSources: (sources: SearchResult[]) => void,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const startTime = Date.now();
    const border = "=".repeat(60);
    const subBorder = "-".repeat(60);

    const intent = QueryRouterService.classify(query);

    process.stdout.write(`\n${border}\n`);
    process.stdout.write(`[QUY TRÌNH RAG: 1. KHỞI ĐỘNG] Nhận câu hỏi từ Client\n`);
    process.stdout.write(`[CÂU HỎI TRUY VẤN]: "${query}"\n`);
    process.stdout.write(`[PHÂN LOẠI Ý ĐỊNH]: ${intent}\n`);
    process.stdout.write(
      `[CẤU HÌNH]: Top-K = ${topK} | Bộ xử lý mô hình = ${
        providerOverride || "Mặc định (Biến môi trường)"
      }\n`
    );
    process.stdout.write(`${subBorder}\n`);

    if (intent === "GREETING") {
      process.stdout.write(
        `[RẼ NHÁNH: CHÀO HỎI] Phản hồi trực tiếp không cần qua RAG cơ sở dữ liệu\n`
      );
      onSources([]);

      const greetingMessage = PromptBuilder.getDirectGreetingMessage(query);
      const words = greetingMessage.split(" ");
      for (let i = 0; i < words.length; i++) {
        const token = i === words.length - 1 ? words[i] : words[i] + " ";
        onChunk(token);
        await new Promise((resolve) => setTimeout(resolve, 15));
      }

      const totalElapsed = Date.now() - startTime;
      process.stdout.write(
        `[HOÀN TẤT CHÀO HỎI]: Thời gian phản hồi trực tiếp: ${totalElapsed}ms\n`
      );
      process.stdout.write(`${border}\n\n`);
      return;
    }

    if (intent === "OUT_OF_SCOPE") {
      process.stdout.write(
        `[RẼ NHÁNH: NGOÀI PHẠM VI] Chuyển qua LLM để phản hồi từ chối lịch sự (bỏ qua RAG Pinecone)\n`
      );
      onSources([]);

      const outOfScopeContext = PromptBuilder.buildOutOfScopeSystemPrompt();
      const provider = LLMProviderFactory.create(providerOverride);
      const providerName = provider.getProviderName();

      process.stdout.write(
        `[GỌI LLM TỪ CHỐI]: Đang gọi ${providerName.toUpperCase()} để sinh phản hồi từ chối...\n`
      );

      let tokenCount = 0;
      const streamStartTime = Date.now();

      await provider.streamResponse(query, outOfScopeContext, (chunk) => {
        tokenCount++;
        onChunk(chunk);
      });

      const streamElapsed = Date.now() - streamStartTime;
      const totalElapsed = Date.now() - startTime;

      process.stdout.write(
        `\n[STREAM HOÀN TẤT]: Đã stream ${tokenCount} phân đoạn token trong ${streamElapsed}ms\n`
      );
      process.stdout.write(
        `[TỔNG KẾT QUY TRÌNH]: Tổng thời gian xử lý: ${totalElapsed}ms (${(
          totalElapsed / 1000
        ).toFixed(2)}s)\n`
      );
      process.stdout.write(`${border}\n\n`);
      return;
    }

    const embedStartTime = Date.now();
    process.stdout.write(
      `[QUY TRÌNH RAG: 2. TẠO VECTOR NHÚNG] Đang tạo vector nhúng cho câu hỏi...\n`
    );
    process.stdout.write(
      `[MÔ HÌNH NHÚNG]: ${config.GEMINI_EMBEDDING_MODEL} (${this.embeddingProvider.getDimensions()} chiều)\n`
    );

    const queryVector = await this.embeddingProvider.embedText(query);
    const embedElapsed = Date.now() - embedStartTime;
    process.stdout.write(
      `[TẠO VECTOR HOÀN TẤT]: Vector ${queryVector.length} chiều được tạo thành công trong ${embedElapsed}ms\n`
    );
    process.stdout.write(`${subBorder}\n`);

    const searchStartTime = Date.now();
    process.stdout.write(
      `[QUY TRÌNH RAG: 3. TRUY VẤN DỮ LIỆU] Đang tìm kiếm đoạn trích tương đồng trên Pinecone...\n`
    );

    const allSources = await this.vectorRepository.similaritySearch(
      queryVector,
      topK
    );
    const searchElapsed = Date.now() - searchStartTime;

    const selectedSources = allSources.slice(0, 4);

    process.stdout.write(
      `[TRUY VẤN HOÀN TẤT]: Tìm thấy ${allSources.length} đoạn trích trên Pinecone trong ${searchElapsed}ms.\n`
    );
    process.stdout.write(
      `[TRÍCH DẪN TOP-${selectedSources.length}]: Chọn ${selectedSources.length} đoạn trích phù hợp nhất đưa vào Prompt LLM:\n`
    );

    if (selectedSources.length > 0) {
      selectedSources.forEach((source, idx) => {
        const filename =
          (source.metadata?.filename as string) ||
          source.documentId ||
          "Không xác định";
        const hierarchy = Array.isArray(source.metadata?.hierarchy)
          ? source.metadata.hierarchy.join(" > ")
          : "";
        const matchScore = (source.score * 100).toFixed(2);
        process.stdout.write(
          `  [${idx + 1}] Độ tương đồng: ${matchScore}% | Tài liệu: ${filename} | ${hierarchy}\n`
        );
      });
    } else {
      process.stdout.write(
        `  (Không tìm thấy đoạn trích phù hợp trong cơ sở dữ liệu)\n`
      );
    }
    process.stdout.write(`${subBorder}\n`);

    onSources(selectedSources);

    process.stdout.write(
      `[QUY TRÌNH RAG: 4. BỔ SUNG NGỮ CẢNH] Đang ghép căn cứ pháp lý vào Prompt...\n`
    );
    const context = PromptBuilder.buildGroundingContext(selectedSources);
    process.stdout.write(
      `[NGỮ CẢNH SẴN SÀNG]: Độ dài ngữ cảnh pháp lý: ${context.length.toLocaleString()} ký tự\n`
    );
    process.stdout.write(`${subBorder}\n`);

    const provider = LLMProviderFactory.create(providerOverride);
    const providerName = provider.getProviderName();

    process.stdout.write(
      `[QUY TRÌNH RAG: 5. STREAM PHẢN HỒI LLM] Đang gọi ${providerName.toUpperCase()} để sinh câu trả lời...\n`
    );

    let tokenCount = 0;
    const streamStartTime = Date.now();

    await provider.streamResponse(query, context, (chunk) => {
      tokenCount++;
      onChunk(chunk);
    });

    const streamElapsed = Date.now() - streamStartTime;
    const totalElapsed = Date.now() - startTime;

    process.stdout.write(
      `\n[STREAM HOÀN TẤT]: Đã stream ${tokenCount} phân đoạn token trong ${streamElapsed}ms\n`
    );
    process.stdout.write(
      `[TỔNG KẾT QUY TRÌNH]: Tổng thời gian xử lý: ${totalElapsed}ms (${(
        totalElapsed / 1000
      ).toFixed(2)}s)\n`
    );
    process.stdout.write(`${border}\n\n`);
  }

  public async chat(
    query: string,
    topK: number = 5,
    providerOverride?: string
  ): Promise<{ answer: string; sources: SearchResult[] }> {
    const intent = QueryRouterService.classify(query);

    if (intent === "GREETING") {
      const greetingMessage = PromptBuilder.getDirectGreetingMessage(query);
      return { answer: greetingMessage, sources: [] };
    }

    if (intent === "OUT_OF_SCOPE") {
      const outOfScopeContext = PromptBuilder.buildOutOfScopeSystemPrompt();
      const provider = LLMProviderFactory.create(providerOverride);
      const answer = await provider.generateResponse(query, outOfScopeContext);
      return { answer, sources: [] };
    }

    const queryVector = await this.embeddingProvider.embedText(query);
    const allSources = await this.vectorRepository.similaritySearch(
      queryVector,
      topK
    );
    const selectedSources = allSources.slice(0, 4);
    const context = PromptBuilder.buildGroundingContext(selectedSources);
    const provider = LLMProviderFactory.create(providerOverride);
    const answer = await provider.generateResponse(query, context);

    return { answer, sources: selectedSources };
  }
}
