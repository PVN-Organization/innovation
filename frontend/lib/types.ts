export type Field = "Công nghệ" | "Quy trình" | "An toàn" | "Môi trường" | "Khác";
export type Status = "Chờ duyệt" | "Đã duyệt";

export type Initiative = {
  id: number;
  ten: string;
  linhVuc: Field;
  tacGia: string;
  dongTacGia: string;
  donVi: string;
  email?: string;
  otp?: string;
  tomTat: string;
  hieuQua: string;
  quanTam: number;
  trangThai: Status;
  diem: number;
  giaiThuong: string;
  ngayNop: string;
  cuaToi?: boolean;
};

export type FormState = {
  ten: string;
  linhVuc: Field;
  tacGia: string;
  dongTacGia: string;
  donVi: string;
  email: string;
  otp: string;
  tomTat: string;
  hieuQua: string;
};
