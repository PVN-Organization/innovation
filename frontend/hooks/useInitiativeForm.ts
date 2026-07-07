"use client";

import { FormEvent, useCallback, useState } from "react";

import { API_BASE, ApiError } from "@/lib/api/client";
import { submitInitiative as apiSubmit } from "@/lib/api/initiatives";
import type { AuthorEntry, FormState, Initiative } from "@/lib/types";

export type AuthorMode = "solo" | "team";
export type FormFieldErrors = Record<string, string>;

const AUTHOR_ROLE = "Đồng tác giả";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEN_LENGTH = 500;
const MAX_DOCX_BYTES = 10 * 1024 * 1024;

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

function emptyAuthor(): AuthorEntry {
  return { vaiTro: AUTHOR_ROLE, hoTen: "", chucVu: "", donVi: "", email: "" };
}

const EMPTY_FORM: FormState = {
  ten: "",
  linhVuc: "Công nghệ",
  danhSachTacGia: [emptyAuthor()],
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
  updateLocal: (id: number, data: Partial<Initiative>) => void;
  refreshInitiatives: () => Promise<void>;
  onCancel: () => void;
};

type ValidationResult = {
  isValid: boolean;
  fieldErrors: FormFieldErrors;
  summaryMessage: string;
};

function isDocxFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".docx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

export function useInitiativeForm({
  updateLocal,
  refreshInitiatives,
  onCancel,
}: Deps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formMessage, setFormMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorMode, setAuthorMode] = useState<AuthorMode>("solo");
  const [finalDocxFile, setFinalDocxFile] = useState<File | null>(null);

  function updateForm(key: keyof FormState, value: string) {
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
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
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[`author.${index}.${field}`];
        return next;
      });
      setForm((current) => {
        const next = [...current.danhSachTacGia];
        next[index] = { ...next[index], [field]: value, vaiTro: AUTHOR_ROLE };
        return { ...current, danhSachTacGia: next };
      });
    },
    [],
  );

  const addAuthor = useCallback(() => {
    setForm((current) => ({
      ...current,
      danhSachTacGia: [...current.danhSachTacGia, emptyAuthor()],
    }));
  }, []);

  const removeAuthor = useCallback((index: number) => {
    setForm((current) => ({
      ...current,
      danhSachTacGia: current.danhSachTacGia
        .filter((_, i) => i !== index)
        .map((author) => ({ ...author, vaiTro: AUTHOR_ROLE })),
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
                vaiTro: AUTHOR_ROLE,
                donVi: current.donVi,
                email: current.email,
              }
            : { ...emptyAuthor(), donVi: current.donVi, email: current.email },
        ],
      }));
      return;
    }

    setForm((current) => {
      const updated = current.danhSachTacGia.map((author) => ({
        ...author,
        vaiTro: AUTHOR_ROLE,
      }));
      return {
        ...current,
        danhSachTacGia:
          updated.length > 1 ? updated : [...updated, emptyAuthor()],
      };
    });
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
      .map((author) => author.hoTen)
      .filter(Boolean)
      .join("; ");
    return { tacGia, dongTacGia };
  }

  function validateForm(
    currentForm: FormState = form,
    docxFile: File | null = finalDocxFile,
  ): ValidationResult {
    const errors: FormFieldErrors = {};

    for (const { key, label } of REQUIRED_TEXT_FIELDS) {
      if (!(currentForm[key] as string).trim()) {
        errors[key] = `${label} là bắt buộc.`;
      }
    }

    if (currentForm.ten.trim().length > MAX_TEN_LENGTH) {
      errors.ten = `Tên sáng kiến tối đa ${MAX_TEN_LENGTH} ký tự.`;
    }

    const contactEmail = currentForm.email.trim();
    if (contactEmail && !EMAIL_RE.test(contactEmail)) {
      errors.email = "Email liên hệ không hợp lệ (ví dụ: ten@pvn.vn).";
    }

    currentForm.danhSachTacGia.forEach((author, index) => {
      if (!author.hoTen.trim()) {
        errors[`author.${index}.hoTen`] = `Họ và tên đồng tác giả ${index + 1} là bắt buộc.`;
      }
      const authorEmail = author.email.trim();
      if (authorEmail && !EMAIL_RE.test(authorEmail)) {
        errors[`author.${index}.email`] = "Email không hợp lệ.";
      }
    });

    const { thoiGianTu, thoiGianDen } = currentForm;
    if (thoiGianTu && thoiGianDen && thoiGianTu > thoiGianDen) {
      errors.thoiGian = "Thời gian kết thúc phải sau hoặc bằng thời gian bắt đầu.";
    }

    if (docxFile) {
      if (!isDocxFile(docxFile)) {
        errors.finalDocx = "Chỉ chấp nhận file .docx.";
      } else if (docxFile.size > MAX_DOCX_BYTES) {
        errors.finalDocx = "File DOCX tối đa 10MB.";
      }
    }

    const labels = Object.values(errors);
    const summaryMessage =
      labels.length > 0
        ? `Vui lòng kiểm tra lại: ${labels.join(" ")}`
        : "";

    return {
      isValid: labels.length === 0,
      fieldErrors: errors,
      summaryMessage,
    };
  }

  function applyValidation(result: ValidationResult): boolean {
    setFieldErrors(result.fieldErrors);
    if (!result.isValid) {
      setFormMessage(result.summaryMessage);
      return false;
    }
    setFieldErrors({});
    return true;
  }

  function setFinalDocx(file: File | null) {
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.finalDocx;
      return next;
    });
    setFinalDocxFile(file);
  }

  function clearFinalDocx() {
    setFinalDocx(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!applyValidation(validateForm())) return;

    const { tacGia, dongTacGia } = deriveFlatAuthors(form.danhSachTacGia);
    const danhSachTacGiaJson = JSON.stringify(
      form.danhSachTacGia.map((author) => ({ ...author, vaiTro: AUTHOR_ROLE })),
    );
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
      setFinalDocxFile(null);
      return;
    }

    setIsSubmitting(true);
    let submitted = false;
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
      if (finalDocxFile) fd.append("file", finalDocxFile, finalDocxFile.name);

      await apiSubmit(fd);
      await refreshInitiatives();
      setFormMessage("Đã gửi sáng kiến. Hồ sơ đã chuyển sang trạng thái Chờ duyệt.");
      submitted = true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setFormMessage("Vui lòng đăng nhập tài khoản Tập đoàn trước khi gửi sáng kiến.");
        return;
      }
      setFormMessage(
        err instanceof Error
          ? `Không thể gửi sáng kiến: ${err.message}`
          : "Không thể gửi sáng kiến. Vui lòng thử lại.",
      );
      return;
    } finally {
      setIsSubmitting(false);
    }

    if (submitted) {
      setForm(EMPTY_FORM);
      setAuthorMode("solo");
      setFinalDocxFile(null);
    }
  }

  function clearForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setAuthorMode("solo");
    setFieldErrors({});
    setFinalDocxFile(null);
    setFormMessage("Đã hủy nhập liệu và trở về danh sách sáng kiến.");
    onCancel();
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setAuthorMode("solo");
    setFieldErrors({});
    setFinalDocxFile(null);
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
        vaiTro: AUTHOR_ROLE,
        donVi: data.donVi ?? first.donVi,
        email: data.email ?? first.email,
      };

      return {
        ...next,
        danhSachTacGia: authors.map((author) => ({
          ...author,
          vaiTro: AUTHOR_ROLE,
        })),
      };
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
          return parsed.map((author) => ({
            vaiTro: AUTHOR_ROLE,
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
        ...emptyAuthor(),
        hoTen: initiative.tacGia,
        donVi: initiative.donVi,
        email: initiative.email ?? "",
      },
      ...initiative.dongTacGia
        .split(";")
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({
          ...emptyAuthor(),
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
    setFieldErrors({});
    setFinalDocxFile(null);
    setFormMessage("Đang chỉnh sửa sáng kiến đã chọn.");
  }

  async function exportDocx() {
    if (!applyValidation(validateForm(form, null))) return;

    const thoiGian = deriveThoiGian();
    const authors = form.danhSachTacGia.map((author) => ({
      ...author,
      vaiTro: AUTHOR_ROLE,
    }));

    const fd = new FormData();
    fd.append("ten", form.ten);
    fd.append("linhVuc", form.linhVuc);
    fd.append("thoiGian", thoiGian);
    fd.append("danhSachTacGia", JSON.stringify(authors));
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
      link.download = "dang-ky-sang-kien.docx";
      link.click();
      URL.revokeObjectURL(url);
      setFormMessage("Đã xuất tệp đăng ký. Bạn có thể chỉnh sửa và tải lên bản cuối cùng.");
    } catch {
      setFormMessage("Không thể kết nối server để xuất DOCX.");
    }
  }

  return {
    form,
    formMessage,
    fieldErrors,
    editingId,
    isSubmitting,
    authorMode,
    finalDocxFile,
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
    setFinalDocx,
    clearFinalDocx,
  };
}
