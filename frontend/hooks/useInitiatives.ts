"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchInitiatives as apiFetch,
  likeInitiative as apiLike,
} from "@/lib/api/initiatives";
import type { Initiative } from "@/lib/types";

const SEED_EXTRA = {
  thoiGian: "",
  lyDo: "",
  mucTieu: "",
  thucTrang: "",
  giaiPhap: "",
  cachThuc: "",
  tinhMoi: "",
  nhanRong: "",
  danhSachTacGia: "",
};

const seedInitiatives: Initiative[] = [
  {
    id: 1,
    ten: "Tối ưu lịch bảo dưỡng cụm máy nén khí trung tâm",
    linhVuc: "Quy trình",
    tacGia: "Nguyễn Minh Anh",
    dongTacGia: "Hoàng Đức Long",
    donVi: "Ban Kỹ thuật Sản xuất",
    tomTat:
      "Chuẩn hóa dữ liệu vận hành để dự báo thời điểm bảo dưỡng, giảm thời gian dừng thiết bị và tăng độ tin cậy cho chuỗi khai thác.",
    hieuQua:
      "Giảm 12% thời gian dừng máy, tiết kiệm chi phí thuê chuyên gia và tăng tính chủ động trong kế hoạch sản xuất.",
    quanTam: 148,
    trangThai: "Đã duyệt",
    diem: 120,
    giaiThuong: "Giải Nhất",
    ngayNop: "12/06/2026",
    ...SEED_EXTRA,
  },
  {
    id: 2,
    ten: "Bảng điều khiển phát thải CO2 theo thời gian thực",
    linhVuc: "Môi trường",
    tacGia: "Trần Hải Yến",
    dongTacGia: "Lê Hoài Nam",
    donVi: "Ban Chuyển đổi số",
    tomTat:
      "Liên thông dữ liệu đo phát thải từ các đơn vị thành viên để phục vụ báo cáo ESG và điều hành giảm phát thải.",
    hieuQua:
      "Rút ngắn 60% thời gian tổng hợp báo cáo, tăng độ minh bạch dữ liệu phát thải và hỗ trợ mục tiêu chuyển dịch năng lượng.",
    quanTam: 132,
    trangThai: "Đã duyệt",
    diem: 96,
    giaiThuong: "Sáng kiến tiêu biểu",
    ngayNop: "18/06/2026",
    ...SEED_EXTRA,
  },
  {
    id: 3,
    ten: "Kho tri thức AI cho hồ sơ pháp lý dự án dầu khí",
    linhVuc: "Công nghệ",
    tacGia: "Phạm Quốc Bảo",
    dongTacGia: "Vũ Thanh Hà",
    donVi: "Ban Pháp chế",
    tomTat:
      "Tìm kiếm thông minh hợp đồng, văn bản pháp lý và bài học kinh nghiệm theo từng dự án trọng điểm.",
    hieuQua:
      "Giảm thời gian tra cứu hồ sơ, hạn chế trùng lặp xử lý và hỗ trợ tư vấn pháp lý nhanh hơn cho các ban chuyên môn.",
    quanTam: 119,
    trangThai: "Chờ duyệt",
    diem: 10,
    giaiThuong: "Chờ xét chọn",
    ngayNop: "21/06/2026",
    ...SEED_EXTRA,
  },
  {
    id: 4,
    ten: "Quy trình phối hợp nhanh khi xử lý sự cố an toàn",
    linhVuc: "An toàn",
    tacGia: "Lê Thu Hương",
    dongTacGia: "Đỗ Minh Tú",
    donVi: "Văn phòng Công đoàn",
    tomTat:
      "Thiết lập checklist số và kênh phản hồi nhanh giữa công đoàn, chuyên môn và các đầu mối hiện trường.",
    hieuQua:
      "Tăng tốc độ phản ứng khi có tình huống phát sinh, cải thiện chất lượng truyền thông an toàn và chăm lo người lao động.",
    quanTam: 104,
    trangThai: "Đã duyệt",
    diem: 84,
    giaiThuong: "Giải Nhì",
    ngayNop: "25/06/2026",
    ...SEED_EXTRA,
  },
  {
    id: 5,
    ten: "Tự động tổng hợp sáng kiến tiết kiệm chi phí vận hành",
    linhVuc: "Công nghệ",
    tacGia: "Đỗ Khánh Linh",
    dongTacGia: "Nguyễn Thế Duy",
    donVi: "Ban Tài chính Kế toán",
    tomTat:
      "Khai thác dữ liệu kế hoạch, mua sắm và vận hành để phát hiện cơ hội tiết kiệm có thể nhân rộng trong toàn bộ máy.",
    hieuQua:
      "Hỗ trợ rà soát ngân sách nhanh hơn, phát hiện hạng mục chi phí bất thường và tạo danh mục cơ hội tiết kiệm định kỳ.",
    quanTam: 96,
    trangThai: "Chờ duyệt",
    diem: 10,
    giaiThuong: "Chờ xét chọn",
    ngayNop: "28/06/2026",
    ...SEED_EXTRA,
  },
  {
    id: 6,
    ten: "Bộ mẫu truyền thông nội bộ cho phong trào đổi mới",
    linhVuc: "Khác",
    tacGia: "Vũ Hoàng Nam",
    dongTacGia: "Mai Phương Chi",
    donVi: "Ban Truyền thông và Văn hóa Doanh nghiệp",
    tomTat:
      "Cung cấp mẫu bài, poster và câu chuyện điển hình để lan tỏa tinh thần thi đua trong toàn bộ máy.",
    hieuQua:
      "Giúp các công đoàn cơ sở truyền thông thống nhất, giảm thời gian chuẩn bị và tăng mức độ tham gia của đoàn viên.",
    quanTam: 87,
    trangThai: "Đã duyệt",
    diem: 72,
    giaiThuong: "Sáng kiến tiêu biểu",
    ngayNop: "02/07/2026",
    ...SEED_EXTRA,
  },
  {
    id: 7,
    ten: "Sổ tay số hóa quy trình tiếp nhận nhân sự dự án mới",
    linhVuc: "Quy trình",
    tacGia: "Bùi Lan Anh",
    dongTacGia: "Trần Việt Hà",
    donVi: "Ban Quản trị nguồn nhân lực",
    tomTat:
      "Tạo checklist onboarding theo từng vai trò, tích hợp hướng dẫn văn hóa an toàn và các đầu mối hỗ trợ nội bộ.",
    hieuQua:
      "Rút ngắn thời gian hội nhập, giảm sai sót giấy tờ và giúp nhân sự mới nhanh chóng nắm bắt yêu cầu dự án.",
    quanTam: 76,
    trangThai: "Đã duyệt",
    diem: 68,
    giaiThuong: "Giải Ba",
    ngayNop: "03/07/2026",
    ...SEED_EXTRA,
  },
  {
    id: 8,
    ten: "Cảnh báo sớm điểm nghẽn phê duyệt hợp đồng mua sắm",
    linhVuc: "Công nghệ",
    tacGia: "Ngô Đức Mạnh",
    dongTacGia: "Phạm Thảo Vy",
    donVi: "Ban Tài chính Kế toán",
    tomTat:
      "Theo dõi trạng thái xử lý hồ sơ mua sắm, cảnh báo những bước chậm tiến độ và gợi ý người phụ trách cần phản hồi.",
    hieuQua:
      "Tăng tính minh bạch, giảm thời gian chờ phê duyệt và hỗ trợ các dự án dầu khí trọng điểm giữ đúng tiến độ.",
    quanTam: 72,
    trangThai: "Chờ duyệt",
    diem: 10,
    giaiThuong: "Chờ xét chọn",
    ngayNop: "04/07/2026",
    ...SEED_EXTRA,
  },
  {
    id: 9,
    ten: "Bản đồ rủi ro HSE cho hoạt động ngoài khơi",
    linhVuc: "An toàn",
    tacGia: "Cao Minh Quân",
    dongTacGia: "Lê Hải Đăng",
    donVi: "Ban An toàn Sức khỏe Môi trường",
    tomTat:
      "Tổng hợp dữ liệu sự cố, thời tiết, ca kíp và khuyến nghị kiểm soát để hỗ trợ ra quyết định an toàn trước ca làm việc.",
    hieuQua:
      "Nâng cao nhận diện rủi ro, giảm nguy cơ tai nạn và hỗ trợ công tác tuyên truyền an toàn theo dữ liệu thực tế.",
    quanTam: 69,
    trangThai: "Đã duyệt",
    diem: 75,
    giaiThuong: "Sáng kiến tiêu biểu",
    ngayNop: "04/07/2026",
    ...SEED_EXTRA,
  },
  {
    id: 10,
    ten: "Thư viện mẫu hợp đồng có chú giải rủi ro",
    linhVuc: "Quy trình",
    tacGia: "Hoàng Mai Trang",
    dongTacGia: "Trần Quang Vinh",
    donVi: "Ban Pháp chế",
    tomTat:
      "Chuẩn hóa các điều khoản thường gặp, gắn chú giải rủi ro và lịch sử xử lý để hỗ trợ các ban lập hồ sơ nhanh hơn.",
    hieuQua:
      "Giảm vòng trao đổi nội bộ, tăng chất lượng hồ sơ ban đầu và hỗ trợ đào tạo nhân sự mới.",
    quanTam: 58,
    trangThai: "Đã duyệt",
    diem: 64,
    giaiThuong: "Đề cử tháng",
    ngayNop: "05/07/2026",
    ...SEED_EXTRA,
  },
];

export function useInitiatives() {
  const [initiatives, setInitiatives] = useState<Initiative[]>(seedInitiatives);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch({ pageSize: 100 });
      if (res.items.length > 0) {
        setInitiatives(res.items);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể kết nối API");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const optimisticLike = useCallback((id: number) => {
    setInitiatives((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quanTam: item.quanTam + 1 } : item,
      ),
    );
    apiLike(id).catch(() => {
      setInitiatives((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quanTam: item.quanTam - 1 } : item,
        ),
      );
    });
  }, []);

  const addLocal = useCallback((initiative: Initiative) => {
    setInitiatives((items) => [initiative, ...items]);
  }, []);

  const updateLocal = useCallback((id: number, data: Partial<Initiative>) => {
    setInitiatives((items) =>
      items.map((item) => (item.id === id ? { ...item, ...data } : item)),
    );
  }, []);

  return {
    initiatives,
    isLoading,
    error,
    optimisticLike,
    refresh,
    addLocal,
    updateLocal,
  };
}
