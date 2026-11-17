import fs from "fs";
import path from "path";
import { config } from "../config/environment.js";
import { ChunkingStrategyFactory } from "../factories/chunkingStrategyFactory.js";
import { GeminiEmbeddingProvider } from "../providers/geminiEmbeddingProvider.js";
import { PineconeRepository } from "../repositories/pineconeRepository.js";
import { EmbeddedChunk } from "../interfaces/vectorRepository.interface.js";

const runIndexing = async (): Promise<void> => {
  const startTime = Date.now();
  process.stdout.write("\n==================================================\n");
  process.stdout.write("[TIẾN TRÌNH INDEXING] Khởi động quá trình nạp dữ liệu pháp luật\n");
  process.stdout.write("==================================================\n\n");

  const dataDir = path.resolve(process.cwd(), "../data");
  if (!fs.existsSync(dataDir)) {
    throw new Error(`Thư mục data không tồn tại tại đường dẫn: ${dataDir}`);
  }

  const files = fs.readdirSync(dataDir).filter((file) => file.endsWith(".md"));
  if (files.length === 0) {
    throw new Error(`Không tìm thấy file .md nào trong thư mục: ${dataDir}`);
  }

  process.stdout.write(
    `[TÌM THẤY DỮ LIỆU] Tìm thấy ${files.length} tài liệu markdown cần nạp:\n`
  );
  files.forEach((file, index) => {
    process.stdout.write(`  ${index + 1}. ${file}\n`);
  });
  process.stdout.write("\n");

  const embeddingProvider = new GeminiEmbeddingProvider();
  const vectorRepository = new PineconeRepository();

  let totalChunksIngested = 0;

  for (const file of files) {
    const fileStartTime = Date.now();
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, "utf-8").trim();

    process.stdout.write(`--------------------------------------------------\n`);
    process.stdout.write(`[TÀI LIỆU] Xử lý: ${file}\n`);
    process.stdout.write(`[KÍCH THƯỚC] Độ dài văn bản: ${content.length.toLocaleString()} ký tự\n`);

    const strategy = ChunkingStrategyFactory.create("markdown", {
      chunkSize: 900,
      chunkOverlap: 120,
    });

    const rawChunks = strategy.chunk(content, {
      filename: file,
      documentType: "nghi_dinh",
      source: "data_folder",
    });

    process.stdout.write(
      `[PHÂN ĐOẠN] Đã tạo thành công ${rawChunks.length} đoạn trích ngữ nghĩa\n`
    );

    const chunkTexts = rawChunks.map((chunk) => chunk.content);
    process.stdout.write(
      `[TẠO EMBEDDING] Đang gọi Google ${config.GEMINI_EMBEDDING_MODEL} (${embeddingProvider.getDimensions()} chiều) theo từng đợt...\n`
    );

    const vectors = await embeddingProvider.embedBatch(chunkTexts);
    process.stdout.write(
      `[TẠO EMBEDDING] Đã tạo xong ${vectors.length} vectors nhúng\n`
    );

    const embeddedChunks: EmbeddedChunk[] = rawChunks.map((chunk, idx) => ({
      id: `${file.replace(/\.md$/, "")}_chunk_${idx}_${chunk.id.slice(0, 8)}`,
      documentId: file,
      text: chunk.content,
      vector: vectors[idx],
      metadata: {
        ...chunk.metadata,
        filename: file,
        chunkIndex: idx,
        totalChunksInFile: rawChunks.length,
      },
    }));

    process.stdout.write(
      `[PINECONE] Đang nạp ${embeddedChunks.length} bản ghi lên Pinecone index: ${config.PINECONE_INDEX_NAME}...\n`
    );
    await vectorRepository.upsert(embeddedChunks);

    const fileElapsedTime = ((Date.now() - fileStartTime) / 1000).toFixed(2);
    process.stdout.write(
      `[THÀNH CÔNG] Hoàn thành tài liệu ${file} trong ${fileElapsedTime}s (${rawChunks.length} đoạn trích)\n\n`
    );

    totalChunksIngested += rawChunks.length;
  }

  const totalElapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
  process.stdout.write("==================================================\n");
  process.stdout.write(
    `[INDEXING HOÀN TẤT] Tổng cộng: ${totalChunksIngested} đoạn trích trong ${totalElapsedTime}s\n`
  );
  process.stdout.write("==================================================\n\n");
};

runIndexing().catch((error) => {
  process.stderr.write(
    `\n[LỖI INDEXING]: ${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exit(1);
});