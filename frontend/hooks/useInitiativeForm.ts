"use client";

import { FormEvent, useCallback, useState } from "react";

import { API_BASE } from "@/lib/api/client";
import { submitInitiative as apiSubmit } from "@/lib/api/initiatives";
import type { AuthorEntry, FormState, Initiative } from "@/lib/types";

export type AuthorMode = "solo" | "team";

const DEPARTMENTS = [
  "Cơ quan Kiểm tra Đảng ủy Tập đoàn",
  "Ban Tổ chức Đảng ủy Tập đoàn",
  "Ban Tuyên giáo và Dân vận Đảng ủy",
  "Văn phòng Đảng ủy Tập đoàn",
  "Văn phòng Đảng Đoàn thể Bộ máy QL&ĐH Tập đoàn",
  "Ban Chiến lược",
  "Ban Tổng hợp",
  "Văn phòng Tập đoàn",
  "Ban Kinh tế - Đầu tư",
  "Ban Quản lý Hợp đồng & Phát triển Dự án E&P",
  "Ban Công nghiệp Khí và Lọc hóa dầu",
  "Ban Kiểm soát nội bộ",
  "Ban Điện và Năng lượng tái tạo",
  "Ban Tài chính - Kế toán",
  "Ban Thương mại Dịch vụ",
  "Ban An toàn Môi trường & Phát triển bền vững",
  "Ban Khoa học Công nghệ & Chuyển đổi số",
  "Ban Thăm dò - Khai thác Dầu khí",
  "Ban Quản trị Nguồn Nhân lực",
  "Ban Pháp chế & Quản lý đấu thầu",
  "Ban Truyền thông và Văn hóa doanh nghiệp",
  "Ban Quản trị rủi ro & Giám sát tuân thủ",
  "Ban Chuẩn bị Đầu tư Dự án Nhà máy điện hạt nhân Ninh Thuận 2",
] as const;

export { DEPARTMENTS };

function emptyAuthor(vaiTro: string): AuthorEntry {
  return { vaiTro, hoTen: "", chucVu: "", donVi: "", email: "" };
}

const EMPTY_FORM: FormState = {
  ten: "",
  linhVuc: "Công nghệ",
  danhSachTacGia: [emptyAuthor("Tác giả")],
  donVi: DEPARTMENTS[0],
  email: "",
  thoiGianTu: "",
  thoiGianDen: "",
  lyDo: "",
  mucTieu: "",
  thucTrang: "",
  giaiPhap: "",
  cachThuc: "",
  tomTat: "",
  hieuQua: "",
  tinhMoi: "",
  nhanRong: "",
};

const REQUIRED_TEXT_FIELDS: { key: keyof FormState; label: string }[] = [
  { key: "ten", label: "Tên sáng kiến" },
  { key: "email", label: "Email liên hệ" },
  { key: "lyDo", label: "Lý do đề xuất" },
  { key: "mucTieu", label: "Mục tiêu" },
  { key: "thucTrang", label: "Thực trạng" },
  { key: "giaiPhap", label: "Giải pháp mới" },
  { key: "cachThuc", label: "Cách thức áp dụng" },
  { key: "hieuQua", label: "Hiệu quả đạt được" },
];

type Deps = {
  initiatives: Initiative[];
  addLocal: (initiative: Initiative) => void;
  updateLocal: (id: number, data: Partial<Initiative>) => void;
  refreshInitiatives: () => Promise<void>;
  onCancel: () => void;
};

export function useInitiativeForm({
  initiatives,
  addLocal,
  updateLocal,
  refreshInitiatives,
  onCancel,
}: Deps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formMessage, setFormMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorMode, setAuthorMode] = useState<AuthorMode>("solo");

  function updateForm(key: keyof FormState, value: string) {
    setForm((current) => {
      const nextForm = { ...current, [key]: value };
      if (authorMode !== "solo" || (key !== "donVi" && key !== "email")) {
        return nextForm;
      }

      const first = nextForm.danhSachTacGia[0];
      if (!first) return nextForm;

      const nextAuthors = [...nextForm.danhSachTacGia];
      nextAuthors[0] = {
        ...first,
        donVi: key === "donVi" ? value : nextForm.donVi,
        email: key === "email" ? value : nextForm.email,
      };
      return { ...nextForm, danhSachTacGia: nextAuthors };
    });
  }

  const updateAuthor = useCallback(
    (index: number, field: keyof AuthorEntry, value: string) => {
      setForm((current) => {
        const next = [...current.danhSachTacGia];
        next[index] = { ...next[index], [field]: value };
        return { ...current, danhSachTacGia: next };
      });
    },
    [],
  );

  const addAuthor = useCallback(() => {
    setForm((current) => ({
      ...current,
      danhSachTacGia: [
        ...current.danhSachTacGia,
        emptyAuthor("Đồng tác giả"),
      ],
    }));
  }, []);

  const removeAuthor = useCallback((index: number) => {
    setForm((current) => ({
      ...current,
      danhSachTacGia: current.danhSachTacGia.filter((_, i) => i !== index),
    }));
  }, []);

  function handleModeChange(mode: AuthorMode) {
    setAuthorMode(mode);
    if (mode === "solo") {
      setForm((current) => ({
        ...current,
        danhSachTacGia: [
          current.danhSachTacGia[0]
            ? {
                ...current.danhSachTacGia[0],
                vaiTro: "Tác giả",
                donVi: current.donVi,
                email: current.email,
              }
            : { ...emptyAuthor("Tác giả"), donVi: current.donVi, email: current.email },
        ],
      }));
    } else {
      setForm((current) => {
        const updated = current.danhSachTacGia.map((a) => ({
          ...a,
          vaiTro: "Đồng tác giả",
        }));
        return {
          ...current,
          danhSachTacGia:
            updated.length > 1
              ? updated
              : [...updated, emptyAuthor("Đồng tác giả")],
        };
      });
    }
  }

  function formatDateVN(iso: string): string {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  function deriveThoiGian(): string {
    const tu = form.thoiGianTu;
    const den = form.thoiGianDen;
    if (tu && den) return `${formatDateVN(tu)} - ${formatDateVN(den)}`;
    if (tu) return `Từ ${formatDateVN(tu)}`;
    if (den) return `Đến ${formatDateVN(den)}`;
    return "";
  }

  function deriveFlatAuthors(authors: AuthorEntry[]) {
    const tacGia = authors[0]?.hoTen ?? "";
    const dongTacGia = authors
      .slice(1)
      .map((a) => a.hoTen)
      .filter(Boolean)
      .join("; ");
    return { tacGia, dongTacGia };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const missing = REQUIRED_TEXT_FIELDS.filter(
      ({ key }) => !(form[key] as string).trim(),
    ).map(({ label }) => label);

    const firstAuthor = form.danhSachTacGia[0];
    if (!firstAuthor?.hoTen.trim()) {
      missing.unshift("Họ và tên tác giả");
    }

    if (authorMode === "team") {
      form.danhSachTacGia.slice(1).forEach((a, i) => {
        if (!a.hoTen.trim()) {
          missing.push(`Họ và tên đồng tác giả #${i + 2}`);
        }
      });
    }

    if (missing.length > 0) {
      setFormMessage(
        `Vui lòng nhập đầy đủ các trường bắt buộc: ${missing.join(", ")}.`,
      );
      return;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = form.email.trim();
    if (!emailRe.test(email)) {
      setFormMessage("Vui lòng nhập email hợp lệ (ví dụ: ten@pvn.vn).");
      return;
    }

    const badAuthorEmails: string[] = [];
    form.danhSachTacGia.forEach((a, i) => {
      const ae = a.email.trim();
      if (ae && !emailRe.test(ae)) {
        badAuthorEmails.push(
          `${a.hoTen || `Tác giả #${i + 1}`} ("${ae}")`,
        );
      }
    });
    if (badAuthorEmails.length > 0) {
      setFormMessage(
        `Email tác giả không hợp lệ: ${badAuthorEmails.join(", ")}.`,
      );
      return;
    }

    const { tacGia, dongTacGia } = deriveFlatAuthors(form.danhSachTacGia);
    const danhSachTacGiaJson = JSON.stringify(form.danhSachTacGia);
    const thoiGian = deriveThoiGian();

    if (editingId) {
      updateLocal(editingId, {
        ...form,
        tacGia,
        dongTacGia,
        danhSachTacGia: danhSachTacGiaJson,
        thoiGian,
      });
      setFormMessage("Đã cập nhật sáng kiến của bạn.");
      setEditingId(null);
      setForm(EMPTY_FORM);
      setAuthorMode("solo");
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("ten", form.ten);
      fd.append("linhVuc", form.linhVuc);
      fd.append("tacGia", tacGia);
      fd.append("dongTacGia", dongTacGia);
      fd.append("danhSachTacGia", danhSachTacGiaJson);
      fd.append("donVi", form.donVi);
      fd.append("tomTat", form.tomTat);
      fd.append("hieuQua", form.hieuQua);
      fd.append("thoiGian", thoiGian);
      fd.append("lyDo", form.lyDo);
      fd.append("mucTieu", form.mucTieu);
      fd.append("thucTrang", form.thucTrang);
      fd.append("giaiPhap", form.giaiPhap);
      fd.append("cachThuc", form.cachThuc);
      fd.append("tinhMoi", form.tinhMoi);
      fd.append("nhanRong", form.nhanRong);
      if (form.email) fd.append("email", form.email);

      await apiSubmit(fd);
      await refreshInitiatives();
      setFormMessage("Đã gửi sáng kiến. Hồ sơ đã chuyển sang trạng thái Chờ duyệt.");
    } catch {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      addLocal({
        id: Math.max(0, ...initiatives.map((i) => i.id)) + 1,
        ten: form.ten,
        linhVuc: form.linhVuc,
        tacGia,
        dongTacGia,
        danhSachTacGia: danhSachTacGiaJson,
        donVi: form.donVi,
        email: form.email,
        thoiGian,
        lyDo: form.lyDo,
        mucTieu: form.mucTieu,
        thucTrang: form.thucTrang,
        giaiPhap: form.giaiPhap,
        cachThuc: form.cachThuc,
        tomTat: form.tomTat,
        hieuQua: form.hieuQua,
        tinhMoi: form.tinhMoi,
        nhanRong: form.nhanRong,
        quanTam: 0,
        trangThai: "Chờ duyệt",
        diem: 10,
        giaiThuong: "Chờ xét chọn",
        ngayNop: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`,
        cuaToi: true,
      });
      setFormMessage(
        "Đã gửi sáng kiến. Hồ sơ đã chuyển sang trạng thái Chờ duyệt.",
      );
    } finally {
      setIsSubmitting(false);
    }

    setForm(EMPTY_FORM);
    setAuthorMode("solo");
  }

  function clearForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setAuthorMode("solo");
    setFormMessage("Đã hủy nhập liệu và trở về danh sách sáng kiến.");
    onCancel();
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setAuthorMode("solo");
    setFormMessage("");
  }

  function prefillFormFromSuggestion(data: Partial<FormState>) {
    setForm((current) => {
      const next = {
        ...current,
        ...data,
        danhSachTacGia: data.danhSachTacGia ?? current.danhSachTacGia,
      };

      const first = next.danhSachTacGia[0];
      if (!first) return next;

      const authors = [...next.danhSachTacGia];
      authors[0] = {
        ...first,
        donVi: data.donVi ?? first.donVi,
        email: data.email ?? first.email,
      };

      return { ...next, danhSachTacGia: authors };
    });
    setEditingId(null);
    setAuthorMode((data.danhSachTacGia?.length ?? 1) > 1 ? "team" : "solo");
    setFormMessage("Đã đưa gợi ý AI vào biểu mẫu. Bạn có thể chỉnh sửa trước khi gửi.");
  }

  function getAuthorsForEdit(initiative: Initiative): AuthorEntry[] {
    if (initiative.danhSachTacGia) {
      try {
        const parsed = JSON.parse(initiative.danhSachTacGia);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((author, index) => ({
            vaiTro: String(author.vaiTro || (index === 0 ? "Tác giả" : "Đồng tác giả")),
            hoTen: String(author.hoTen || ""),
            chucVu: String(author.chucVu || ""),
            donVi: String(author.donVi || initiative.donVi || ""),
            email: String(author.email || ""),
          }));
        }
      } catch {
        // Fall back to the legacy flat author fields below.
      }
    }

    return [
      {
        ...emptyAuthor("Tác giả"),
        hoTen: initiative.tacGia,
        donVi: initiative.donVi,
        email: initiative.email ?? "",
      },
      ...initiative.dongTacGia
        .split(";")
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({
          ...emptyAuthor("Đồng tác giả"),
          hoTen: name,
          donVi: initiative.donVi,
        })),
    ];
  }

  function startEdit(initiative: Initiative) {
    const authors = getAuthorsForEdit(initiative);
    setForm({
      ten: initiative.ten,
      linhVuc: initiative.linhVuc,
      danhSachTacGia: authors,
      donVi: initiative.donVi,
      email: initiative.email ?? "",
      thoiGianTu: "",
      thoiGianDen: "",
      lyDo: initiative.lyDo,
      mucTieu: initiative.mucTieu,
      thucTrang: initiative.thucTrang,
      giaiPhap: initiative.giaiPhap,
      cachThuc: initiative.cachThuc,
      tomTat: initiative.tomTat,
      hieuQua: initiative.hieuQua,
      tinhMoi: initiative.tinhMoi,
      nhanRong: initiative.nhanRong,
    });
    setEditingId(initiative.id);
    setAuthorMode(authors.length > 1 ? "team" : "solo");
    setFormMessage("Đang chỉnh sửa sáng kiến đã chọn.");
  }

  async function exportDocx() {
    const thoiGian = deriveThoiGian();

    const fd = new FormData();
    fd.append("ten", form.ten);
    fd.append("linhVuc", form.linhVuc);
    fd.append("thoiGian", thoiGian);
    fd.append("danhSachTacGia", JSON.stringify(form.danhSachTacGia));
    fd.append("lyDo", form.lyDo);
    fd.append("mucTieu", form.mucTieu);
    fd.append("thucTrang", form.thucTrang);
    fd.append("giaiPhap", form.giaiPhap);
    fd.append("cachThuc", form.cachThuc);
    fd.append("hieuQua", form.hieuQua);
    fd.append("tinhMoi", form.tinhMoi);
    fd.append("nhanRong", form.nhanRong);

    try {
      const resp = await fetch(`${API_BASE}/api/v1/initiatives/preview-docx`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      if (!resp.ok) {
        setFormMessage("Lỗi khi xuất DOCX. Vui lòng thử lại.");
        return;
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "sang-kien-preview.docx";
      link.click();
      URL.revokeObjectURL(url);
      setFormMessage("Đã xuất file DOCX theo biểu mẫu thành công.");
    } catch {
      setFormMessage("Không thể kết nối server để xuất DOCX.");
    }
  }

  return {
    form,
    formMessage,
    editingId,
    isSubmitting,
    authorMode,
    updateForm,
    handleModeChange,
    updateAuthor,
    addAuthor,
    removeAuthor,
    handleSubmit,
    clearForm,
    resetForm,
    prefillFormFromSuggestion,
    exportDocx,
    startEdit,
  };
}
