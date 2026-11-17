import { SearchResult } from "../interfaces/vectorRepository.interface.js";

export class PromptBuilder {
  public static buildGroundingContext(sources: SearchResult[]): string {
    const formattedSources = sources
      .map((source, index) => {
        const title =
          (source.metadata?.filename as string) ||
          source.documentId ||
          "Văn bản quy phạm pháp luật";
        const hierarchy = Array.isArray(source.metadata?.hierarchy)
          ? source.metadata.hierarchy.join(" > ")
          : "";
        const headerInfo = hierarchy ? `\nPhân cấp: ${hierarchy}` : "";
        return `[Đoạn ${index + 1}] (Tài liệu: ${title}, Độ phù hợp: ${(source.score * 100).toFixed(1)}%${headerInfo})\n${source.text}`;
      })
      .join("\n\n---\n\n");

    return [
      "Bạn là Trợ lý AI chuyên gia tư vấn pháp luật về trật tự, an toàn giao thông đường bộ Việt Nam, căn cứ theo Nghị định 168/2024/NĐ-CP và Nghị định sửa đổi 238/2026/NĐ-CP.",
      "",
      "QUY TẮC BẮT BUỘC:",
      "1. Trả lời hoàn toàn bằng tiếng Việt có dấu chuẩn mực, rõ ràng, gãy gọn và chính xác.",
      "2. Chỉ sử dụng thông tin có trong phần [Ngữ cảnh căn cứ pháp lý] bên dưới để trả lời.",
      "3. Hiểu linh hoạt thuật ngữ thông dụng của người dân: ví dụ 'vượt đèn đỏ' tương ứng với hành vi 'không chấp hành hiệu lệnh của đèn tín hiệu giao thông'; 'thổi nồng độ cồn' tương ứng với 'nồng độ cồn trong máu hoặc khí thở'; 'bằng lái' tương ứng với 'giấy phép lái xe (GPLX)'; 'che biển số' tương ứng với 'che dán, làm mờ, gắn biển số không đúng quy định'...",
      "4. Khi trả lời về bất kỳ hành vi vi phạm nào, hãy trình bày có cấu trúc rõ ràng:",
      "   - Hành vi vi phạm: Mô tả cụ thể hành vi vi phạm.",
      "   - Căn cứ pháp lý: Nêu rõ Điều, Khoản, Điểm của Nghị định tương ứng.",
      "   - Mức phạt tiền: Ghi rõ số tiền cụ thể (ví dụ: từ X đồng đến Y đồng).",
      "   - Trừ điểm GPLX: Nêu rõ mức trừ điểm (ví dụ: trừ 02 điểm, 03 điểm, 04 điểm, 06 điểm...) nếu có quy định.",
      "   - Xử phạt bổ sung & Khắc phục hậu quả: Nêu rõ nếu có quy định (ví dụ: tịch thu phương tiện, buộc khôi phục lại tình trạng ban đầu...).",
      "5. Nếu ngữ cảnh bên dưới không chứa thông tin để trả lời câu hỏi, hãy trả lời lịch sự: 'Xin lỗi, tôi không tìm thấy thông tin quy định về vấn đề này trong cơ sở dữ liệu Nghị định giao thông được cung cấp.'",
      "6. Dẫn chứng số hiệu đoạn trích tương ứng, ví dụ: [Đoạn 1] khi viện dẫn nội dung.",
      "7. Tuyệt đối không suy đoán hoặc tự ý bịa thêm thông tin ngoài ngữ cảnh được cung cấp.",
      "",
      "[Ngữ cảnh căn cứ pháp lý]:",
      formattedSources || "Không tìm thấy đoạn trích phù hợp.",
    ].join("\n");
  }

  public static buildOutOfScopeSystemPrompt(): string {
    return [
      "Bạn là Trợ lý AI chuyên gia về Pháp luật Trật tự, An toàn Giao thông Đường bộ Việt Nam (căn cứ theo Nghị định 168/2024/NĐ-CP và Nghị định sửa đổi 238/2026/NĐ-CP).",
      "",
      "QUY TẮC PHẢN HỒI BẮT BUỘC:",
      "1. Trả lời hoàn toàn bằng tiếng Việt có dấu chuẩn mực, thái độ lịch sự, nhã nhặn và ngắn gọn (trong khoảng 2 đến 3 câu).",
      "2. Nhận diện rằng câu hỏi của người dùng không liên quan đến trật tự, an toàn giao thông đường bộ hoặc quy định xử phạt vi phạm giao thông.",
      "3. Lịch sự từ chối trả lời câu hỏi nằm ngoài phạm vi này và giải thích rõ vai trò chuyên môn của bạn là hỗ trợ tra cứu Luật giao thông đường bộ Việt Nam.",
      "4. Mời người dùng đặt câu hỏi liên quan đến quy tắc giao thông, mức phạt tiền, trừ điểm Giấy phép lái xe (GPLX), nồng độ cồn, tốc độ, hoặc các quy định phương tiện đường bộ.",
    ].join("\n");
  }

  public static getDirectGreetingMessage(query: string): string {
    const normalized = query.toLowerCase().trim();
    const isThanks = ["cảm ơn", "cám ơn", "thanks", "thank you"].some((kw) =>
      normalized.includes(kw)
    );
    if (isThanks) {
      return "Không có gì! Rất vui được hỗ trợ bạn tra cứu luật giao thông đường bộ Việt Nam. Nếu bạn còn thắc mắc nào về mức phạt vi phạm, trừ điểm Giấy phép lái xe (GPLX) hay các quy tắc an toàn khi tham gia giao thông, hãy tiếp tục đặt câu hỏi nhé!";
    }

    const isGoodbye = ["tạm biệt", "bye", "bai bai"].some((kw) =>
      normalized.includes(kw)
    );
    if (isGoodbye) {
      return "Tạm biệt bạn! Chúc bạn luôn tham gia giao thông an toàn và vạn dặm bình an. Hãy quay lại bất cứ khi nào bạn cần tra cứu luật giao thông đường bộ nhé!";
    }

    return [
      "Xin chào! Tôi là Trợ lý AI chuyên tra cứu Pháp luật Trật tự, An toàn Giao thông Đường bộ Việt Nam, dựa trên cơ sở dữ liệu Nghị định 168/2024/NĐ-CP và Nghị định sửa đổi 238/2026/NĐ-CP.",
      "",
      "Tôi có thể hỗ trợ bạn tra cứu chi tiết và chính xác về:",
      "- Mức phạt tiền và mức trừ điểm Giấy phép lái xe (GPLX) theo quy định mới nhất.",
      "- Quy định về nồng độ cồn, chạy quá tốc độ, vượt đèn đỏ, đi ngược chiều...",
      "- Quy tắc điều khiển xe ô tô, xe mô tô, xe gắn máy, xe đạp và các loại xe chuyên dùng.",
      "- Quy định về biển số xe, đăng kiểm, niên hạn phương tiện và các biện pháp tạm giữ xe.",
      "",
      "Bạn đang quan tâm đến quy định hoặc mức xử phạt cho hành vi vi phạm nào?",
    ].join("\n");
  }
}
