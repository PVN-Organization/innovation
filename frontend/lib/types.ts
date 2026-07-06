export type Field = "Công nghệ" | "Quy trình" | "An toàn" | "Môi trường" | "Khác";
export type Status = "Chờ duyệt" | "Đã duyệt";

export type AuthorEntry = {
  vaiTro: string;
  hoTen: string;
  chucVu: string;
  donVi: string;
  email: string;
};

export type Initiative = {
  id: number;
  ten: string;
  linhVuc: Field;
  tacGia: string;
  dongTacGia: string;
  danhSachTacGia?: string;
  donVi: string;
  email?: string;
  thoiGian: string;
  lyDo: string;
  mucTieu: string;
  thucTrang: string;
  giaiPhap: string;
  cachThuc: string;
  tomTat: string;
  hieuQua: string;
  tinhMoi: string;
  nhanRong: string;
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
  danhSachTacGia: AuthorEntry[];
  donVi: string;
  email: string;
  thoiGianTu: string;
  thoiGianDen: string;
  lyDo: string;
  mucTieu: string;
  thucTrang: string;
  giaiPhap: string;
  cachThuc: string;
  tomTat: string;
  hieuQua: string;
  tinhMoi: string;
  nhanRong: string;
};
