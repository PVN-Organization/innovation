"use client";

import { FormEvent, useState } from "react";

import { submitInitiative as apiSubmit } from "@/lib/api/initiatives";
import type { FormState, Initiative } from "@/lib/types";

export const DEMO_OTP = "246810";

const EMPTY_FORM: FormState = {
  ten: "",
  linhVuc: "Công nghệ",
  tacGia: "Nguyễn Minh Anh",
  dongTacGia: "",
  donVi: "Ban Chuyển đổi số",
  email: "",
  otp: "",
  tomTat: "",
  hieuQua: "",
};

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
  const [otpSentTo, setOtpSentTo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateForm(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "email") setOtpSentTo("");
  }

  function sendOtp() {
    const email = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormMessage("Vui lòng nhập email hợp lệ trước khi gửi OTP.");
      return;
    }
    setOtpSentTo(email);
    setFormMessage(
      `Đã gửi OTP mô phỏng tới ${email}. Mã dùng thử: ${DEMO_OTP}.`,
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = form.email.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (
      !form.ten.trim() ||
      !form.tacGia.trim() ||
      !form.tomTat.trim() ||
      !form.hieuQua.trim() ||
      !validEmail
    ) {
      setFormMessage(
        "Vui lòng nhập đủ thông tin sáng kiến và email hợp lệ để xác thực khi gửi.",
      );
      return;
    }

    if (editingId) {
      updateLocal(editingId, {
        ten: form.ten,
        linhVuc: form.linhVuc,
        tacGia: form.tacGia,
        dongTacGia: form.dongTacGia,
        donVi: form.donVi,
        email: form.email,
        otp: form.otp,
        tomTat: form.tomTat,
        hieuQua: form.hieuQua,
      });
      setFormMessage("Đã cập nhật sáng kiến của bạn.");
      setEditingId(null);
      setForm(EMPTY_FORM);
      return;
    }

    if (otpSentTo !== email) {
      setFormMessage(
        "Vui lòng bấm Gửi OTP tại ô Email xác thực trước khi gửi sáng kiến.",
      );
      return;
    }
    if (form.otp.trim() !== DEMO_OTP) {
      setFormMessage(
        "Mã OTP chưa đúng. Vui lòng nhập mã 246810 để xác thực email trong prototype.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("ten", form.ten);
      fd.append("linhVuc", form.linhVuc);
      fd.append("tacGia", form.tacGia);
      fd.append("dongTacGia", form.dongTacGia);
      fd.append("donVi", form.donVi);
      fd.append("tomTat", form.tomTat);
      fd.append("hieuQua", form.hieuQua);
      if (form.email) fd.append("email", form.email);

      await apiSubmit(fd);
      await refreshInitiatives();
      setFormMessage("Đã xác thực email và gửi sáng kiến thành công.");
    } catch {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      addLocal({
        id: Math.max(0, ...initiatives.map((i) => i.id)) + 1,
        ...form,
        quanTam: 0,
        trangThai: "Chờ duyệt",
        diem: 10,
        giaiThuong: "Chờ xét chọn",
        ngayNop: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`,
        cuaToi: true,
      });
      setFormMessage(
        "Đã xác thực email và gửi sáng kiến. Hồ sơ đã chuyển sang trạng thái Chờ duyệt.",
      );
    } finally {
      setIsSubmitting(false);
    }

    setForm(EMPTY_FORM);
    setOtpSentTo("");
  }

  function clearForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setOtpSentTo("");
    setFormMessage("Đã hủy nhập liệu và trở về danh sách sáng kiến.");
    onCancel();
  }

  function exportDocx() {
    const content = `
      CỔNG THÔNG TIN SÁNG KIẾN CÔNG ĐOÀN BM QL&ĐH PETROVIETNAM

      Tên sáng kiến: ${form.ten || "Chưa nhập"}
      Lĩnh vực: ${form.linhVuc}
      Tác giả/Đồng tác giả: ${form.tacGia || "Chưa nhập"} ${form.dongTacGia ? `; ${form.dongTacGia}` : ""}
      Đơn vị/Phòng ban: ${form.donVi}
      Email xác thực: ${form.email || "Chưa nhập"}

      Nội dung tóm tắt:
      ${form.tomTat || "Chưa nhập"}

      Hiệu quả dự kiến:
      ${form.hieuQua || "Chưa nhập"}
    `;
    const blob = new Blob([content], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mau-sang-kien-cong-doan-petrovietnam.docx";
    link.click();
    URL.revokeObjectURL(url);
    setFormMessage("Đã mô phỏng xuất file DOCX theo mẫu sáng kiến.");
  }

  return {
    form,
    formMessage,
    otpSentTo,
    editingId,
    isSubmitting,
    updateForm,
    sendOtp,
    handleSubmit,
    clearForm,
    exportDocx,
  };
}
