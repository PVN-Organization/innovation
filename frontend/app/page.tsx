"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import type { ReactElement, ReactNode, SVGProps } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useInitiativeForm, DEPARTMENTS } from "@/hooks/useInitiativeForm";
import type { AuthorMode } from "@/hooks/useInitiativeForm";
import { useInitiatives } from "@/hooks/useInitiatives";
import type { AuthorEntry, Field, FormState, Initiative, Status } from "@/lib/types";

type Role = "guest" | "employee" | "admin";
type View = "landing" | "initiatives" | "stats" | "competition" | "guide" | "admin";
type InsightsTab = "overview" | "competition" | "data";
type FilterKind = "department" | "field" | "status" | "author";
type ChatSuggestion = {
  title: string;
  field: Field;
  problem: string;
  solution: string;
  expectedImpact: string;
  prefill: Partial<FormState>;
};
type ChatMessage = {
  from: "bot" | "user";
  text: string;
  suggestions?: ChatSuggestion[];
};
type IconProps = SVGProps<SVGSVGElement>;
type LucideIcon = (props: IconProps) => ReactElement;

function IconSvg({
  children,
  ...props
}: { children: ReactNode } & IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      {...props}
    >
      {children}
    </svg>
  );
}

const HomeIcon: LucideIcon = (props) => (
  <IconSvg {...props}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></IconSvg>
);
const Lightbulb: LucideIcon = (props) => (
  <IconSvg {...props}><path d="M9 18h6" /><path d="M10 22h4" /><path d="M8.5 14a6 6 0 1 1 7 0c-.7.5-1.1 1.4-1.2 2.2H9.7c-.1-.8-.5-1.7-1.2-2.2Z" /></IconSvg>
);
const BarChart3: LucideIcon = (props) => (
  <IconSvg {...props}><path d="M4 20V10" /><path d="M12 20V4" /><path d="M20 20v-7" /><path d="M3 20h18" /></IconSvg>
);
const Trophy: LucideIcon = (props) => (
  <IconSvg {...props}><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M5 5H3v3a4 4 0 0 0 4 4" /><path d="M19 5h2v3a4 4 0 0 1-4 4" /></IconSvg>
);
const BookOpen: LucideIcon = (props) => (
  <IconSvg {...props}><path d="M12 7v14" /><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v19H7.5A3.5 3.5 0 0 0 4 17.5v-12Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v19h4.5a3.5 3.5 0 0 1 3.5-3.5v-12Z" /></IconSvg>
);
const ShieldCheck: LucideIcon = (props) => (
  <IconSvg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-5" /></IconSvg>
);
const Menu: LucideIcon = (props) => (
  <IconSvg {...props}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></IconSvg>
);
const X: LucideIcon = (props) => (
  <IconSvg {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></IconSvg>
);
const PenLine: LucideIcon = (props) => (
  <IconSvg {...props}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></IconSvg>
);
const Bot: LucideIcon = (props) => (
  <IconSvg {...props}><path d="M12 8V4" /><path d="M8 4h8" /><rect x="5" y="8" width="14" height="10" rx="3" /><path d="M9 13h.01" /><path d="M15 13h.01" /><path d="M10 16h4" /><path d="M3 12h2" /><path d="M19 12h2" /></IconSvg>
);
const Users: LucideIcon = (props) => (
  <IconSvg {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></IconSvg>
);
const Heart: LucideIcon = (props) => (
  <IconSvg {...props}><path d="M19 14c2-2 3-5.5.5-8a5 5 0 0 0-7.5.6A5 5 0 0 0 4.5 6c-2.5 2.5-1.5 6 .5 8l7 7Z" /></IconSvg>
);
const Sparkles: LucideIcon = (props) => (
  <IconSvg {...props}><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z" /><path d="m5 14 1 2.7L9 18l-3 1.3L5 22l-1-2.7L1 18l3-1.3Z" /></IconSvg>
);
const FileText: LucideIcon = (props) => (
  <IconSvg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h6" /></IconSvg>
);
const Filter: LucideIcon = (props) => (
  <IconSvg {...props}><path d="M3 5h18" /><path d="M6 12h12" /><path d="M10 19h4" /></IconSvg>
);
const Lock: LucideIcon = (props) => (
  <IconSvg {...props}><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></IconSvg>
);

const fields: Field[] = ["Công nghệ", "Quy trình", "An toàn", "Môi trường", "Khác"];
const statuses = ["Tất cả", "Chờ duyệt", "Đã duyệt"];
const fieldMeta: Record<Field, { color: string; bg: string; image: string }> = {
  "Công nghệ": {
    color: "var(--blue-700)",
    bg: "var(--blue-100)",
    image: "/visuals/thumb-tech.png",
  },
  "Quy trình": {
    color: "var(--green-600)",
    bg: "var(--green-100)",
    image: "/visuals/thumb-process.png",
  },
  "An toàn": {
    color: "var(--gold-500)",
    bg: "var(--gold-100)",
    image: "/visuals/thumb-safety.png",
  },
  "Môi trường": {
    color: "var(--green-500)",
    bg: "var(--green-100)",
    image: "/visuals/thumb-environment.png",
  },
  "Khác": {
    color: "var(--cyan-500)",
    bg: "var(--cyan-100)",
    image: "/visuals/thumb-other.png",
  },
};
const departments = [
  "Ban Kỹ thuật Sản xuất",
  "Ban Chuyển đổi số",
  "Ban Quản trị nguồn nhân lực",
  "Ban Tài chính Kế toán",
  "Ban Pháp chế",
  "Ban An toàn Sức khỏe Môi trường",
  "Văn phòng Công đoàn",
  "Ban Truyền thông và Văn hóa Doanh nghiệp",
];

const innovators = [
  {
    ten: "Nguyễn Minh Anh",
    donVi: "Ban Thăm dò - Khai thác Dầu khí",
    quote: "Sáng kiến tốt bắt đầu từ một bất tiện nhỏ được nhìn đủ kỹ.",
    count: 3,
    image: "/visuals/thumb-process.png",
  },
  {
    ten: "Trần Hải Yến",
    donVi: "Ban Khoa học Công nghệ & Chuyển đổi số",
    quote: "Dữ liệu không thay con người, dữ liệu giúp chúng ta quyết định tự tin hơn.",
    count: 3,
    image: "/visuals/thumb-environment.png",
  },
  {
    ten: "Lê Thu Hương",
    donVi: "Văn phòng Tập đoàn",
    quote: "Đổi mới trong công đoàn là làm cho việc tốt trở nên dễ lặp lại.",
    count: 2,
    image: "/visuals/thumb-other.png",
  },
];

function compactNumber(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return String(value);
}

function buildDonutGradient(fieldCounts: readonly (readonly [Field, number])[]) {
  const total = fieldCounts.reduce((sum, [, count]) => sum + count, 0);
  let current = 0;
  const segments = fieldCounts.map(([field, count]) => {
    const start = current;
    const size = total === 0 ? 0 : (count / total) * 100;
    current += size;
    return `${fieldMeta[field].color} ${start}% ${current}%`;
  });
  return `conic-gradient(${segments.join(", ") || "var(--line) 0 100%"})`;
}

export default function Home() {
  const { user: authUser } = useAuth();
  const {
    initiatives,
    optimisticLike,
    refresh: refreshInitiatives,
    addLocal,
    updateLocal,
  } = useInitiatives();

  const [demoRole, setRole] = useState<Role>("guest");
  const role: Role = authUser?.is_admin ? "admin" : authUser ? "employee" : demoRole;
  const [view, setView] = useState<View>("landing");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("Tất cả");
  const [selectedField, setSelectedField] = useState("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [adminDepartment, setAdminDepartment] = useState("Tất cả");
  const [adminField, setAdminField] = useState("Tất cả");
  const [adminStatus, setAdminStatus] = useState("Tất cả");
  const [adminSearch, setAdminSearch] = useState("");
  const [range, setRange] = useState("Tháng này");
  const [insightsTab, setInsightsTab] = useState<InsightsTab>("competition");
  const [initiativeMode, setInitiativeMode] = useState<"list" | "form">("list");
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showWordPreview, setShowWordPreview] = useState(false);
  const [tablePulse, setTablePulse] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      from: "bot",
      text: "Xin chào, tôi là Trợ lý AI Sáng kiến. Tôi có thể gợi ý ý tưởng dựa trên dữ liệu sáng kiến hiện có.",
    },
  ]);

  const {
    form,
    formMessage,
    editingId,
    authorMode,
    updateForm,
    handleModeChange,
    updateAuthor,
    addAuthor,
    removeAuthor,
    handleSubmit: submitInitiative,
    clearForm,
    resetForm,
    exportDocx,
    startEdit,
    prefillFormFromSuggestion,
  } = useInitiativeForm({
    initiatives,
    addLocal,
    updateLocal,
    refreshInitiatives,
    onCancel: () => {
      setView("initiatives");
      setInitiativeMode("list");
    },
  });
  const isAuthed = role !== "guest";
  const isAdmin = role === "admin";

  function requireAuth() {
    if (isAuthed) return true;
    setShowLoginPrompt(true);
    return false;
  }

  function go(nextView: View) {
    if (nextView === "stats") {
      setInsightsTab(isAuthed ? "data" : "overview");
      setView("competition");
      setMobileOpen(false);
      setChatOpen(false);
      return;
    }
    if (nextView === "admin" && !isAdmin) {
      setShowLoginPrompt(true);
      return;
    }
    if (nextView === "competition") {
      setInsightsTab("competition");
    }
    setView(nextView);
    setMobileOpen(false);
    setChatOpen(false);
  }

  function startCreate() {
    if (!requireAuth()) return;
    resetForm();
    setView("initiatives");
    setInitiativeMode("form");
  }

  const departmentCounts = useMemo(() => {
    const counts = initiatives.reduce<Record<string, number>>((acc, item) => {
      acc[item.donVi] = (acc[item.donVi] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [initiatives]);

  const publicFiltered = useMemo(
    () =>
      initiatives.filter(
        (item) =>
          (selectedDepartment === "Tất cả" || item.donVi === selectedDepartment) &&
          (selectedField === "Tất cả" || item.linhVuc === selectedField),
      ),
    [initiatives, selectedDepartment, selectedField],
  );

  const detailedFiltered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return initiatives.filter(
      (item) =>
        (selectedDepartment === "Tất cả" || item.donVi === selectedDepartment) &&
        (selectedField === "Tất cả" || item.linhVuc === selectedField) &&
        (selectedStatus === "Tất cả" || item.trangThai === selectedStatus) &&
        (!query ||
          item.ten.toLowerCase().includes(query) ||
          item.tacGia.toLowerCase().includes(query) ||
          item.tomTat.toLowerCase().includes(query)),
    );
  }, [initiatives, searchQuery, selectedDepartment, selectedField, selectedStatus]);

  const adminItems = useMemo(() => {
    const query = adminSearch.trim().toLowerCase();
    return initiatives.filter(
      (item) =>
        (adminDepartment === "Tất cả" || item.donVi === adminDepartment) &&
        (adminField === "Tất cả" || item.linhVuc === adminField) &&
        (adminStatus === "Tất cả" || item.trangThai === adminStatus) &&
        (!query ||
          item.ten.toLowerCase().includes(query) ||
          item.tacGia.toLowerCase().includes(query) ||
          item.donVi.toLowerCase().includes(query) ||
          item.tomTat.toLowerCase().includes(query)),
    );
  }, [adminDepartment, adminField, adminSearch, adminStatus, initiatives]);

  const fieldCounts = useMemo(() => {
    const counts = publicFiltered.reduce<Record<string, number>>((acc, item) => {
      acc[item.linhVuc] = (acc[item.linhVuc] ?? 0) + 1;
      return acc;
    }, {});
    return fields.map((field) => [field, counts[field] ?? 0] as const);
  }, [publicFiltered]);

  const leaderBoard = useMemo(() => {
    const counts = initiatives.reduce<Record<string, { donVi: string; count: number }>>(
      (acc, item) => {
        acc[item.tacGia] = {
          donVi: item.donVi,
          count: (acc[item.tacGia]?.count ?? 0) + 1,
        };
        return acc;
      },
      {},
    );
    return Object.entries(counts)
      .map(([ten, info]) => ({ ten, donVi: info.donVi, soSangKien: info.count }))
      .sort((a, b) => b.soSangKien - a.soSangKien)
      .slice(0, 5);
  }, [initiatives]);

  const totals = useMemo(() => {
    const approved = initiatives.filter((item) => item.trangThai === "Đã duyệt").length;
    const pending = initiatives.filter((item) => item.trangThai === "Chờ duyệt").length;
    const interests = initiatives.reduce((sum, item) => sum + item.quanTam, 0);
    const topField = fieldCounts.slice().sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Công nghệ";
    return { approved, pending, interests, topField };
  }, [fieldCounts, initiatives]);

  const filterSummary = useMemo(
    () =>
      [
        selectedDepartment !== "Tất cả" ? { key: "department", label: "Phòng ban", value: selectedDepartment } : null,
        selectedField !== "Tất cả" ? { key: "field", label: "Lĩnh vực", value: selectedField } : null,
        selectedStatus !== "Tất cả" ? { key: "status", label: "Trạng thái", value: selectedStatus } : null,
        searchQuery.trim() ? { key: "search", label: "Tìm kiếm", value: searchQuery.trim() } : null,
      ].filter(Boolean) as { key: string; label: string; value: string }[],
    [searchQuery, selectedDepartment, selectedField, selectedStatus],
  );

  function clearFilters() {
    setSelectedDepartment("Tất cả");
    setSelectedField("Tất cả");
    setSelectedStatus("Tất cả");
    setSearchQuery("");
  }

  function applyChartFilter(kind: FilterKind, value: string, targetView?: View) {
    if (kind === "department") setSelectedDepartment(value);
    if (kind === "field") setSelectedField(value);
    if (kind === "status") setSelectedStatus(value);
    if (kind === "author") setSearchQuery(value);
    setTablePulse(true);
    window.setTimeout(() => setTablePulse(false), 900);
    if (targetView === "stats") {
      setInsightsTab("data");
      setView("competition");
      return;
    }
    if (targetView) setView(targetView);
  }

  function loginAdmin() {
    setRole("admin");
    setView("admin");
    setMobileOpen(false);
    setChatOpen(false);
  }

  function loginEmployee() {
    setRole("employee");
    setShowLoginPrompt(false);
    setMobileOpen(false);
  }

  function logout() {
    setRole("guest");
    setView("landing");
    setMobileOpen(false);
    setSelectedInitiative(null);
    setChatOpen(false);
  }

  function openDetails(item: Initiative) {
    if (!requireAuth()) return;
    setSelectedInitiative(item);
  }

  function likeInitiative(id: number) {
    if (!requireAuth()) return;
    optimisticLike(id);
    setSelectedInitiative((item) =>
      item?.id === id ? { ...item, quanTam: item.quanTam + 1 } : item,
    );
  }

  function editInitiative(item: Initiative) {
    if (!requireAuth()) return;
    startEdit(item);
    setView("initiatives");
    setInitiativeMode("form");
  }

  function exportCsv() {
    const header = [
      "Tên sáng kiến",
      "Lĩnh vực",
      "Tác giả",
      "Đơn vị",
      "Trạng thái",
      "Quan tâm",
      "Điểm",
      "Tag giải thưởng",
    ];
    const rows = adminItems.map((item) => [
      item.ten,
      item.linhVuc,
      item.tacGia,
      item.donVi,
      item.trangThai,
      String(item.quanTam),
      String(item.diem),
      item.giaiThuong,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bao-cao-sang-kien-cong-doan.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function aiAnswer(input: string) {
    const lower = input.toLowerCase();
    const topTech = initiatives.filter((item) => item.linhVuc === "Công nghệ").slice(0, 2);
    if (lower.includes("khcn") || lower.includes("tiết kiệm") || lower.includes("đmst")) {
      return `Bạn có thể phát triển sáng kiến "Trợ lý phát hiện cơ hội tiết kiệm KHCN-ĐMST" dựa trên dữ liệu vận hành, mua sắm và năng lượng. Nên tham khảo ${topTech.map((item) => item.ten).join(" và ")} để tạo bộ chỉ số tiết kiệm có thể đo được.`;
    }
    if (lower.includes("nhân lực") || lower.includes("quản trị nguồn nhân lực")) {
      return "Với Ban Quản trị nguồn nhân lực, một hướng mạnh là số hóa onboarding cho nhân sự dự án, gắn mentor nội bộ, checklist an toàn và mốc hoàn thành học liệu. Sáng kiến này dễ đo hiệu quả qua thời gian hội nhập và mức độ hài lòng.";
    }
    if (lower.includes("an toàn") || lower.includes("hse")) {
      return "Nhóm an toàn có thể làm bản đồ rủi ro HSE theo ca kíp, dùng dữ liệu thời tiết, lịch làm việc và sự cố gần nhất để nhắc việc trước ca. Ý tưởng phù hợp với mục tiêu chăm lo người lao động.";
    }
    return "Tôi gợi ý bắt đầu từ một điểm nghẽn có dữ liệu đo được: thời gian chờ, chi phí lặp lại, rủi ro an toàn hoặc mức độ hài lòng của đoàn viên. Sau đó đặt chỉ số trước/sau để sáng kiến dễ phê duyệt và nhân rộng.";
  }

  function aiSuggestions(input: string): ChatSuggestion[] {
    const lower = input.toLowerCase();
    if (lower.includes("nhân lực") || lower.includes("quản trị nguồn nhân lực")) {
      return [
        {
          title: "Số hóa onboarding đoàn viên và nhân sự dự án",
          field: "Quy trình",
          problem: "Thông tin hội nhập, mentor và checklist an toàn đang phân tán theo nhiều đầu mối.",
          solution: "Tạo checklist số theo vai trò, gắn mentor nội bộ và nhắc việc theo mốc 7-30-60 ngày.",
          expectedImpact: "Rút ngắn thời gian hội nhập, tăng mức độ hài lòng và giảm lỗi lặp lại.",
          prefill: {
            ten: "Số hóa onboarding đoàn viên và nhân sự dự án",
            linhVuc: "Quy trình",
            donVi: "Ban Quản trị nguồn nhân lực",
            lyDo: "Quy trình hội nhập còn phân tán, khó theo dõi tiến độ và mức độ sẵn sàng của nhân sự mới.",
            mucTieu: "Chuẩn hóa trải nghiệm hội nhập, giúp người lao động nắm nhanh thông tin công đoàn, an toàn và quy trình phối hợp.",
            thucTrang: "Checklist, tài liệu và phản hồi hiện được trao đổi rời rạc qua email hoặc file riêng.",
            giaiPhap: "Xây dựng bộ checklist số, gắn mentor, nhắc việc tự động và dashboard theo dõi tiến độ hội nhập.",
            cachThuc: "Thí điểm tại một nhóm nhân sự dự án, đo thời gian hoàn thành checklist và mức độ hài lòng trước khi nhân rộng.",
            tomTat: "Số hóa onboarding bằng checklist, mentor và dashboard theo dõi tiến độ.",
            hieuQua: "Rút ngắn thời gian hội nhập, tăng trải nghiệm đoàn viên và giảm chi phí phối hợp.",
            tinhMoi: "Kết hợp dữ liệu tiến độ, nhắc việc và phản hồi đoàn viên trên một luồng số.",
            nhanRong: "Có thể áp dụng cho các ban/văn phòng có nhân sự mới hoặc nhân sự luân chuyển.",
          },
        },
      ];
    }

    if (lower.includes("an toàn") || lower.includes("hse")) {
      return [
        {
          title: "Bản đồ cảnh báo rủi ro HSE theo ca làm việc",
          field: "An toàn",
          problem: "Cảnh báo an toàn thường đến sau khi đã phát sinh tình huống hoặc phụ thuộc kinh nghiệm cá nhân.",
          solution: "Tổng hợp lịch làm việc, thời tiết, điểm nóng và sự cố gần nhất thành bản đồ cảnh báo trước ca.",
          expectedImpact: "Giảm rủi ro vận hành, tăng chủ động nhắc việc và bảo vệ người lao động.",
          prefill: {
            ten: "Bản đồ cảnh báo rủi ro HSE theo ca làm việc",
            linhVuc: "An toàn",
            donVi: "Ban An toàn Môi trường & Phát triển bền vững",
            lyDo: "Cần công cụ cảnh báo sớm rủi ro an toàn dựa trên dữ liệu ca kíp, môi trường và sự cố gần nhất.",
            mucTieu: "Nâng cao năng lực phòng ngừa rủi ro HSE trước ca làm việc.",
            thucTrang: "Thông tin cảnh báo đang phân tán, khó tổng hợp nhanh cho từng nhóm lao động.",
            giaiPhap: "Xây dựng dashboard cảnh báo rủi ro theo ca với điểm nóng, checklist nhắc việc và lịch sử sự cố.",
            cachThuc: "Thu thập dữ liệu ca kíp, thời tiết, vị trí công việc và sự cố để tạo mức cảnh báo theo ngày.",
            tomTat: "Dashboard cảnh báo rủi ro HSE trước ca làm việc.",
            hieuQua: "Giảm rủi ro an toàn, tăng chủ động kiểm soát và nâng cao văn hóa an toàn.",
            tinhMoi: "Kết hợp dữ liệu vận hành với cảnh báo trực quan theo thời gian gần thực.",
            nhanRong: "Có thể mở rộng cho các đơn vị sản xuất, vận hành, kiểm tra hiện trường.",
          },
        },
      ];
    }

    return [
      {
        title: "Trợ lý phát hiện cơ hội tiết kiệm KHCN-ĐMST",
        field: "Công nghệ",
        problem: "Các cơ hội tiết kiệm năng lượng, chi phí và thời gian xử lý chưa được phát hiện sớm từ dữ liệu hiện có.",
        solution: "Dùng dashboard dữ liệu và AI gợi ý điểm nghẽn, ưu tiên sáng kiến có chỉ số trước/sau rõ ràng.",
        expectedImpact: "Tăng số sáng kiến có khả năng đo hiệu quả, giảm lãng phí và thúc đẩy đổi mới xanh số.",
        prefill: {
          ten: "Trợ lý phát hiện cơ hội tiết kiệm KHCN-ĐMST",
          linhVuc: "Công nghệ",
          donVi: "Ban Khoa học Công nghệ & Chuyển đổi số",
          lyDo: "Nhiều dữ liệu vận hành và quản trị chưa được khai thác để phát hiện cơ hội tiết kiệm.",
          mucTieu: "Tạo công cụ gợi ý sáng kiến dựa trên dữ liệu, ưu tiên các cơ hội có thể đo lường hiệu quả.",
          thucTrang: "Ý tưởng cải tiến phụ thuộc nhiều vào kinh nghiệm cá nhân và chưa có cơ chế tổng hợp dữ liệu thường xuyên.",
          giaiPhap: "Xây dựng dashboard kết hợp AI để phát hiện điểm nghẽn, đề xuất nhóm sáng kiến và chỉ số đánh giá trước/sau.",
          cachThuc: "Thí điểm với dữ liệu chi phí, thời gian xử lý, năng lượng và phản hồi đoàn viên tại một số ban/văn phòng.",
          tomTat: "AI gợi ý cơ hội tiết kiệm và đổi mới dựa trên dữ liệu nội bộ.",
          hieuQua: "Tăng chất lượng sáng kiến, giảm lãng phí và tạo nền dữ liệu cho thi đua đổi mới.",
          tinhMoi: "Kết hợp GenAI, dashboard dữ liệu và luồng đóng góp sáng kiến công đoàn.",
          nhanRong: "Có thể nhân rộng cho các lĩnh vực quy trình, môi trường, an toàn và văn hóa số.",
        },
      },
    ];
  }

  function sendChat(text: string) {
    const message = text.trim();
    if (!message) return;
    const suggestions = aiSuggestions(message);
    setChatMessages((items) => [
      ...items,
      { from: "user", text: message },
      { from: "bot", text: aiAnswer(message), suggestions },
    ]);
    setChatInput("");
  }

  return (
    <main className="app-shell text-[var(--navy-900)]">
      <Navigation
        role={role}
        view={view}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        login={loginEmployee}
        loginAdmin={loginAdmin}
        startCreate={startCreate}
        logout={logout}
        go={go}
      />

      {view === "landing" && (
        <LandingPage
          isAuthed={isAuthed}
          initiatives={initiatives}
          filtered={publicFiltered}
          departmentCounts={departmentCounts}
          fieldCounts={fieldCounts}
          totals={totals}
          selectedField={selectedField}
          filterSummary={filterSummary}
          applyChartFilter={applyChartFilter}
          clearFilters={clearFilters}
          startCreate={startCreate}
          openDetails={openDetails}
          openChat={() => {
            if (!requireAuth()) return;
            setChatOpen(true);
          }}
          showLogin={() => setShowLoginPrompt(true)}
          go={go}
        />
      )}

      {view === "initiatives" && (
        <InitiativesPage
          isAuthed={isAuthed}
          mode={initiativeMode}
          setMode={setInitiativeMode}
          items={detailedFiltered}
          form={form}
          formMessage={formMessage}
          editingId={editingId}
          selectedDepartment={selectedDepartment}
          selectedField={selectedField}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
          setSelectedDepartment={setSelectedDepartment}
          setSelectedField={setSelectedField}
          setSelectedStatus={setSelectedStatus}
          setSearchQuery={setSearchQuery}
          filterSummary={filterSummary}
          clearFilters={clearFilters}
          updateForm={updateForm}
          authorMode={authorMode}
          onModeChange={handleModeChange}
          updateAuthor={updateAuthor}
          addAuthor={addAuthor}
          removeAuthor={removeAuthor}
          submitInitiative={submitInitiative}
          exportDocx={exportDocx}
          clearForm={clearForm}
          openDetails={openDetails}
          likeInitiative={likeInitiative}
          editInitiative={editInitiative}
          showWordPreview={() => setShowWordPreview(true)}
          login={loginEmployee}
          tablePulse={tablePulse}
        />
      )}

      {view === "competition" && (
        <CompetitionPage
          isAuthed={isAuthed}
          activeTab={insightsTab}
          setActiveTab={setInsightsTab}
          range={range}
          setRange={setRange}
          items={detailedFiltered}
          initiatives={initiatives}
          totals={totals}
          departmentCounts={departmentCounts}
          fieldCounts={fieldCounts}
          leaderBoard={leaderBoard}
          selectedDepartment={selectedDepartment}
          selectedField={selectedField}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
          setSelectedDepartment={setSelectedDepartment}
          setSelectedField={setSelectedField}
          setSelectedStatus={setSelectedStatus}
          setSearchQuery={setSearchQuery}
          filterSummary={filterSummary}
          clearFilters={clearFilters}
          openDetails={openDetails}
          likeInitiative={likeInitiative}
          applyChartFilter={applyChartFilter}
          login={loginEmployee}
          tablePulse={tablePulse}
        />
      )}

      {view === "guide" && (
        <GuidePage
          isAuthed={isAuthed}
          startCreate={startCreate}
          openChat={() => {
            if (!requireAuth()) return;
            setChatOpen(true);
          }}
          login={loginEmployee}
        />
      )}

      {view === "admin" && isAdmin && (
        <AdminPortal
          items={adminItems}
          department={adminDepartment}
          field={adminField}
          status={adminStatus}
          setDepartment={setAdminDepartment}
          setField={setAdminField}
          setStatus={setAdminStatus}
          searchQuery={adminSearch}
          setSearchQuery={setAdminSearch}
          exportCsv={exportCsv}
          openDetails={openDetails}
          changeStatus={(id, status) => {
            updateLocal(id, { trangThai: status });
            setSelectedInitiative((item) => (item?.id === id ? { ...item, trangThai: status } : item));
          }}
        />
      )}

      {selectedInitiative && (
        <DetailDrawer
          item={selectedInitiative}
          canInteract={isAuthed}
          close={() => setSelectedInitiative(null)}
          like={() => likeInitiative(selectedInitiative.id)}
          edit={() => editInitiative(selectedInitiative)}
        />
      )}

      {showWordPreview && (
        <WordPreview form={form} close={() => setShowWordPreview(false)} exportDocx={exportDocx} />
      )}

      {showLoginPrompt && (
        <LoginPrompt
          close={() => setShowLoginPrompt(false)}
          login={loginEmployee}
        />
      )}

      {isAuthed && (
        <Chatbot
          open={chatOpen}
          setOpen={setChatOpen}
          messages={chatMessages}
          input={chatInput}
          setInput={setChatInput}
          send={sendChat}
          applySuggestion={(suggestion) => {
            prefillFormFromSuggestion(suggestion.prefill);
            setView("initiatives");
            setInitiativeMode("form");
            setChatOpen(false);
          }}
        />
      )}
    </main>
  );
}

function Navigation({
  role,
  view,
  mobileOpen,
  setMobileOpen,
  login,
  loginAdmin,
  startCreate,
  logout,
  go,
}: {
  role: Role;
  view: View;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  login: () => void;
  loginAdmin: () => void;
  startCreate: () => void;
  logout: () => void;
  go: (view: View) => void;
}) {
  const isAdmin = role === "admin";
  const isGuest = role === "guest";
  const roleLabel = isAdmin ? "Quản trị viên" : role === "employee" ? "Tài khoản Tập đoàn" : "Chưa đăng nhập";
  const navItems: { id: View; label: string; icon: LucideIcon; visible: boolean }[] = [
    { id: "landing", label: "Trang chủ", icon: HomeIcon, visible: true },
    { id: "initiatives", label: "Sáng kiến", icon: PenLine, visible: true },
    { id: "competition", label: "Thi đua & Thống kê", icon: Trophy, visible: true },
    { id: "guide", label: "Hướng dẫn", icon: BookOpen, visible: true },
    { id: "admin", label: "Quản trị", icon: ShieldCheck, visible: isAdmin },
  ];
  const visibleNavItems = navItems.filter((item) => item.visible);

  function handleGo(nextView: View) {
    go(nextView);
  }

  function handleCreate() {
    startCreate();
    setMobileOpen(false);
  }

  return (
    <header className="top-nav fixed inset-x-0 top-0 z-40">
      <div className="app-container grid h-16 grid-cols-[minmax(230px,290px)_minmax(0,1fr)_auto] items-center gap-3 lg:h-[76px]">
        <button className="focus-ring flex min-w-0 items-center gap-3 text-left" onClick={() => go("landing")}>
          <img src="/logo-pvn.png" alt="Petrovietnam" className="h-10 w-auto object-contain" />
          <span className="min-w-0 leading-tight">
            <span className="block whitespace-nowrap text-[11px] font-black uppercase text-[var(--green-600)] sm:text-xs">
              Công đoàn Công ty Mẹ
            </span>
            <span className="block whitespace-nowrap text-sm font-black uppercase text-[var(--green-600)] sm:text-base">
              Cổng thông tin sáng kiến
            </span>
          </span>
        </button>

        <nav className="hidden min-w-0 items-center justify-center gap-5 min-[1360px]:flex">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`top-nav-link inline-flex items-center gap-1.5 whitespace-nowrap px-0.5 py-2 text-sm font-bold transition ${
                  view === item.id
                    ? "is-active text-[var(--navy-900)]"
                    : "text-[var(--navy-800)] hover:text-[var(--green-700)]"
                }`}
                onClick={() => handleGo(item.id)}
                aria-current={view === item.id ? "page" : undefined}
              >
                <Icon className="hidden h-4 w-4 2xl:block" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 min-[1360px]:flex">
          {isGuest ? (
            <>
              <button
                className="whitespace-nowrap rounded-md border border-[var(--green-600)] bg-white px-3 py-2 text-sm font-black text-[var(--green-700)]"
                onClick={() => handleGo("initiatives")}
              >
                Đăng ký sáng kiến
              </button>
              <button
                className="whitespace-nowrap rounded-md bg-[var(--green-600)] px-3 py-2 text-sm font-black text-white shadow-md shadow-[var(--green-600)]/20"
                onClick={login}
              >
                Đăng nhập tài khoản Tập đoàn
              </button>
            </>
          ) : (
            <>
              <span className="rounded-md bg-white px-3 py-2 text-sm font-bold text-[var(--muted)]">
                {roleLabel}
              </span>
              {!isAdmin && (
                <button
                  className="hidden rounded-md border border-[var(--line)] bg-white px-3 py-2 text-xs font-black text-[var(--muted)] 2xl:block"
                  onClick={loginAdmin}
                  title="Prototype: chuyển sang Admin"
                >
                  Admin
                </button>
              )}
              <button
                className="whitespace-nowrap rounded-md bg-[var(--green-600)] px-3 py-2 text-sm font-black text-white shadow-md shadow-[var(--green-600)]/20"
                onClick={handleCreate}
              >
                Tạo sáng kiến
              </button>
              <button
                className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-black text-[var(--navy-800)]"
                onClick={logout}
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-md border border-[var(--line)] bg-white text-[var(--navy-900)] min-[1360px]:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--line)] bg-white/96 px-4 py-4 shadow-xl min-[1360px]:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            <div className="mb-2 rounded-lg bg-[var(--mist)] px-3 py-2 text-sm font-black text-[var(--navy-800)]">
              {roleLabel}
            </div>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-black ${
                    view === item.id ? "bg-[var(--navy-900)] text-white" : "bg-white text-[var(--navy-800)]"
                  }`}
                  onClick={() => handleGo(item.id)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
            {isGuest ? (
              <div className="mt-2 grid gap-2">
                <button
                  className="rounded-md border border-[var(--green-600)] px-4 py-3 text-sm font-black text-[var(--green-700)]"
                  onClick={() => handleGo("initiatives")}
                >
                  Đăng ký sáng kiến
                </button>
                <button className="rounded-md bg-[var(--green-600)] px-4 py-3 text-sm font-black text-white" onClick={login}>
                  Đăng nhập tài khoản Tập đoàn
                </button>
                <button className="rounded-md border border-[var(--line)] px-4 py-3 text-sm font-black text-[var(--muted)]" onClick={loginAdmin}>
                  Đăng nhập Admin
                </button>
              </div>
            ) : (
              <div className="mt-2 grid gap-2">
                {!isAdmin && (
                  <button className="rounded-md border border-[var(--line)] px-4 py-3 text-sm font-black text-[var(--muted)]" onClick={loginAdmin}>
                    Chuyển sang Admin
                  </button>
                )}
                <button className="rounded-md bg-[var(--green-600)] px-4 py-3 text-sm font-black text-white" onClick={handleCreate}>
                  Tạo sáng kiến
                </button>
                <button className="rounded-md border border-[var(--line)] px-4 py-3 text-sm font-black" onClick={logout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function LandingPage({
  isAuthed,
  initiatives,
  filtered,
  departmentCounts,
  fieldCounts,
  totals,
  selectedField,
  filterSummary,
  applyChartFilter,
  clearFilters,
  startCreate,
  openDetails,
  openChat,
  showLogin,
  go,
}: {
  isAuthed: boolean;
  initiatives: Initiative[];
  filtered: Initiative[];
  departmentCounts: [string, number][];
  fieldCounts: readonly (readonly [Field, number])[];
  totals: { approved: number; pending: number; interests: number; topField: Field };
  selectedField: string;
  filterSummary: { key: string; label: string; value: string }[];
  applyChartFilter: (kind: FilterKind, value: string, targetView?: View) => void;
  clearFilters: () => void;
  startCreate: () => void;
  openDetails: (item: Initiative) => void;
  openChat: () => void;
  showLogin: () => void;
  go: (view: View) => void;
}) {
  return (
    <>
      <section className="energy-flow campaign-hero relative min-h-[520px] overflow-hidden bg-white text-[var(--navy-900)] sm:min-h-[560px]">
        <img
          src="/visuals/hero-green-innovation-flow.png"
          alt="Dòng chảy sáng kiến xanh số"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.9)_31%,rgba(255,255,255,0.42)_58%,rgba(255,255,255,0.08)_82%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,var(--mist))]" />
        <div className="energy-grid absolute inset-0 opacity-55" />
        <div className="app-container relative z-10 pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32">
          <div className="max-w-[760px]">
            <p className="mb-3 w-fit rounded-full bg-white/80 px-4 py-2 text-xs font-black uppercase text-[var(--green-700)] shadow-sm">
              Cổng thông tin sáng kiến Công đoàn Công ty Mẹ
            </p>
            <h1 className="campaign-title text-balance text-[2.75rem] font-black leading-[0.98] text-[var(--navy-900)] sm:text-6xl lg:text-[5rem]">
              Ý tưởng hôm nay, giá trị ngày mai
            </h1>
            <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-[var(--navy-800)] sm:text-lg">
              Đóng góp ý tưởng, tìm cảm hứng với AI, lan tỏa thi đua đổi mới trong Công ty Mẹ.
            </p>
            <div className="mt-7 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              <CampaignMetric icon={Lightbulb} value={String(initiatives.length)} label="Sáng kiến" color="var(--green-600)" />
              <CampaignMetric icon={Heart} value={compactNumber(totals.interests)} label="Quan tâm" color="var(--green-500)" />
              <CampaignMetric icon={Trophy} value={String(departmentCounts.length)} label="Đơn vị" color="var(--gold-500)" />
              <CampaignMetric icon={Users} value={String(fields.length)} label="Lĩnh vực" color="var(--blue-700)" />
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-md bg-[var(--green-600)] px-5 py-3 text-sm font-black text-white shadow-lg shadow-green-900/15" onClick={startCreate}>
                Viết sáng kiến
              </button>
              <button className="rounded-md border border-[var(--green-600)] bg-white/85 px-5 py-3 text-sm font-black text-[var(--green-700)]" onClick={openChat}>
                Hỏi AI
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="app-container relative z-10 mt-4 lg:-mt-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_330px]">
          <div className="card grid overflow-hidden rounded-xl md:grid-cols-4">
            <LandingShortcut icon={Trophy} title="Top Ban/Văn phòng" text="Có nhiều sáng kiến nhất" action="Xem bảng thi đua" onClick={() => go("competition")} color="var(--gold-500)" />
            <LandingShortcut icon={Users} title="Top cá nhân" text="Truyền cảm hứng đổi mới" action="Xem chi tiết" onClick={() => go("competition")} color="var(--green-600)" />
            <LandingShortcut icon={Heart} title="Sáng kiến được quan tâm" text="Nhiều hưởng ứng nhất" action="Khám phá ngay" onClick={() => (isAuthed ? go("initiatives") : showLogin())} color="var(--green-500)" />
            <LandingShortcut icon={BarChart3} title="Tỷ lệ sáng kiến" text="Theo lĩnh vực trọng tâm" action="Xem biểu đồ" onClick={() => (isAuthed ? go("stats") : showLogin())} color="var(--blue-700)" />
          </div>
          <LandingAiCard isAuthed={isAuthed} openChat={openChat} showLogin={showLogin} />
        </div>
      </section>

      <BasicStats
        isAuthed={isAuthed}
        filtered={filtered}
        departmentCounts={departmentCounts}
        fieldCounts={fieldCounts}
        selectedField={selectedField}
        filterSummary={filterSummary}
        applyChartFilter={applyChartFilter}
        clearFilters={clearFilters}
        showLogin={showLogin}
        openDetails={openDetails}
        go={go}
      />

      <HonorFooter />
    </>
  );
}

function CampaignMetric({ icon: Icon, value, label, color }: { icon: LucideIcon; value: string; label: string; color: string }) {
  return (
    <div className="campaign-metric rounded-xl bg-white/82 p-3 shadow-sm backdrop-blur">
      <Icon className="h-6 w-6" style={{ color }} />
      <p className="mt-2 text-2xl font-black leading-none" style={{ color }}>{value}</p>
      <p className="mt-1 text-xs font-black text-[var(--navy-800)]">{label}</p>
    </div>
  );
}

function LandingShortcut({
  icon: Icon,
  title,
  text,
  action,
  onClick,
  color,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  action: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button className="group border-b border-[var(--line)] p-5 text-left transition hover:bg-[var(--mist)] md:border-b-0 md:border-r" onClick={onClick}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-sm" style={{ color }}>
          <Icon className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <span className="block font-black text-[var(--navy-900)]">{title}</span>
          <span className="mt-1 block text-sm font-semibold leading-5 text-[var(--muted)]">{text}</span>
          <span className="mt-3 block text-xs font-black text-[var(--green-700)] group-hover:underline">{action} →</span>
        </span>
      </div>
    </button>
  );
}

function LandingAiCard({ isAuthed, openChat, showLogin }: { isAuthed: boolean; openChat: () => void; showLogin: () => void }) {
  const prompts = ["Tiết kiệm chi phí", "Nâng cao an toàn", "Tối ưu quy trình", "Chuyển đổi số"];
  return (
    <article className="card relative overflow-hidden rounded-xl p-5">
      <div className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-[var(--green-500)] shadow-[0_0_0_6px_rgba(25,169,87,0.12)]" />
      <div className="flex items-center gap-4">
        <div className="ai-bot-illustration shrink-0" aria-hidden="true" />
        <div>
          <h3 className="font-black text-[var(--navy-900)]">Trò chuyện cùng AI</h3>
          <p className="mt-1 text-sm leading-5 text-[var(--muted)]">Gợi ý ý tưởng, tìm cảm hứng từ kho sáng kiến.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button key={prompt} className="rounded-full bg-[var(--mist)] px-3 py-1.5 text-xs font-black text-[var(--navy-800)]" onClick={isAuthed ? openChat : showLogin}>
            {prompt}
          </button>
        ))}
      </div>
      <button className="mt-5 w-full rounded-md bg-[var(--green-600)] px-4 py-3 text-sm font-black text-white" onClick={isAuthed ? openChat : showLogin}>
        {isAuthed ? "Mở trợ lý AI" : "Đăng nhập để hỏi AI"}
      </button>
    </article>
  );
}

function BasicStats({
  isAuthed,
  filtered,
  departmentCounts,
  fieldCounts,
  selectedField,
  filterSummary,
  applyChartFilter,
  clearFilters,
  showLogin,
  openDetails,
  go,
}: {
  isAuthed: boolean;
  filtered: Initiative[];
  departmentCounts: [string, number][];
  fieldCounts: readonly (readonly [Field, number])[];
  selectedField: string;
  filterSummary: { key: string; label: string; value: string }[];
  applyChartFilter: (kind: FilterKind, value: string, targetView?: View) => void;
  clearFilters: () => void;
  showLogin: () => void;
  openDetails: (item: Initiative) => void;
  go: (view: View) => void;
}) {
  const maxDepartment = Math.max(...departmentCounts.map(([, count]) => count), 1);
  const topInitiatives = filtered.slice().sort((a, b) => b.quanTam - a.quanTam).slice(0, 3);

  return (
    <section className="app-container py-7 lg:py-9">
      <SectionTitle title="Trang thống kê cơ bản" icon={Sparkles} />
      <ActiveFilterChips filters={filterSummary.filter((item) => item.key !== "status" && item.key !== "search")} clearFilters={clearFilters} />
      <div className="landing-dashboard overflow-hidden rounded-xl lg:grid lg:grid-cols-[1fr_1.08fr_1fr]">
        <section className="landing-dashboard-panel border-b border-[var(--line)] p-5 lg:border-b-0 lg:border-r">
          <h3 className="text-2xl font-black leading-tight text-[var(--navy-900)]">Bảng thi đua</h3>
          <div className="mt-5 grid grid-cols-3 rounded-lg bg-[var(--mist)] p-1 text-center text-xs font-black text-[var(--muted)]">
            <button className="rounded-md bg-white px-2 py-2 text-[var(--green-700)] shadow-sm">Theo ban/văn phòng</button>
            <button className="px-2 py-2" onClick={() => go("competition")}>Theo cá nhân</button>
            <button className="px-2 py-2" onClick={() => go("stats")}>Theo lĩnh vực</button>
          </div>
          <div className="mt-5 space-y-3">
            {departmentCounts.slice(0, 5).map(([name, count], index) => (
              <button key={name} className="grid w-full grid-cols-[32px_1fr_34px] items-center gap-3 text-left" onClick={() => applyChartFilter("department", name)}>
                <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${index < 3 ? "bg-[var(--gold-500)] text-white" : "bg-[var(--mist)] text-[var(--navy-800)]"}`}>
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-[var(--navy-900)]">{name}</span>
                  <span className="mt-2 block h-2 rounded-full bg-[var(--mist)]">
                    <span className="block h-2 rounded-full bg-[var(--green-600)]" style={{ width: `${(count / maxDepartment) * 100}%` }} />
                  </span>
                </span>
                <span className="text-right text-sm font-black">{count}</span>
              </button>
            ))}
          </div>
          <button className="mt-5 rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-black text-[var(--green-700)]" onClick={() => go("competition")}>
            Xem đầy đủ bảng xếp hạng →
          </button>
        </section>

        <section className="landing-dashboard-panel border-b border-[var(--line)] p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-black text-[var(--navy-900)]">Sáng kiến theo lĩnh vực</h3>
            <button className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-xs font-black text-[var(--muted)]" onClick={() => go("stats")}>
              Năm 2024
            </button>
          </div>
          <FieldFlowChart
            total={filtered.length}
            fieldCounts={fieldCounts}
            selectedField={selectedField}
            onFieldSelect={(field) => applyChartFilter("field", field)}
          />
          <p className="mt-3 text-xs font-semibold text-[var(--muted)]">Nhấp vào biểu đồ để xem chi tiết theo từng lĩnh vực.</p>
        </section>

        <section className="landing-dashboard-panel p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-black text-[var(--navy-900)]">Top sáng kiến được quan tâm</h3>
            <button className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-xs font-black text-[var(--muted)]" onClick={() => go("competition")}>
              Tháng này
            </button>
          </div>
          <div className="mt-5 divide-y divide-[var(--line)]">
            {topInitiatives.map((item, index) => (
              <button key={item.id} className="grid w-full grid-cols-[54px_28px_1fr_auto] items-center gap-3 py-3 text-left" onClick={() => (isAuthed ? openDetails(item) : showLogin())}>
                <img src={fieldMeta[item.linhVuc].image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--blue-100)] text-sm font-black text-[var(--blue-700)]">{index + 1}</span>
                <span className="min-w-0">
                  <span className="line-clamp-1 text-sm font-black text-[var(--navy-900)]">{item.ten}</span>
                  <span className="mt-1 block truncate text-xs font-semibold text-[var(--muted)]">{item.tacGia} · {item.donVi}</span>
                </span>
                <span className="flex items-center gap-1 text-sm font-black text-[var(--green-600)]">
                  <Heart className="h-4 w-4" /> {item.quanTam}
                </span>
              </button>
            ))}
          </div>
          <button className="mt-4 w-full rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-black text-[var(--green-700)]" onClick={() => (isAuthed ? go("initiatives") : showLogin())}>
            Xem tất cả sáng kiến →
          </button>
        </section>
      </div>
    </section>
  );
}

function FieldFlowChart({
  total,
  fieldCounts,
  selectedField,
  onFieldSelect,
}: {
  total: number;
  fieldCounts: readonly (readonly [Field, number])[];
  selectedField: string;
  onFieldSelect: (field: Field) => void;
}) {
  const segments = fieldCounts.map(([field, count], index) => ({
    field,
    count,
    color: fieldMeta[field].color,
    y: 38 + index * 34,
    width: 20 + Math.max(12, count * 10),
  }));
  const conic = buildDonutGradient(fieldCounts);

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-[1.1fr_150px] sm:items-center">
      <svg className="h-44 w-full" viewBox="0 0 330 190" role="img" aria-label="Luồng sáng kiến theo lĩnh vực">
        {segments.map((segment, index) => (
          <g
            key={segment.field}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => onFieldSelect(segment.field)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onFieldSelect(segment.field);
            }}
          >
            <path
              d={`M8 ${segment.y} C 92 ${segment.y - 18}, 134 ${segment.y + 18}, 210 ${segment.y - 2}`}
              fill="none"
              stroke={segment.color}
              strokeWidth={segment.width}
              strokeLinecap="round"
              opacity={selectedField !== "Tất cả" && selectedField !== segment.field ? 0.28 : 0.82}
            />
            <circle cx="8" cy={segment.y} r="4" fill={segment.color} />
            <text x="226" y={42 + index * 28} fill="var(--navy-800)" fontSize="11" fontWeight="800">{segment.field}</text>
          </g>
        ))}
      </svg>
      <div className="mx-auto grid h-36 w-36 place-items-center rounded-full" style={{ background: conic }}>
        <button className="grid h-[66%] w-[66%] place-items-center rounded-full bg-white text-center shadow-inner" onClick={() => onFieldSelect((fieldCounts[0]?.[0] ?? "Công nghệ") as Field)}>
          <span>
            <span className="block text-xs font-black text-[var(--muted)]">Tổng số</span>
            <span className="block text-3xl font-black text-[var(--navy-900)]">{total}</span>
            <span className="block text-xs font-bold text-[var(--muted)]">sáng kiến</span>
          </span>
        </button>
      </div>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        {fieldCounts.map(([field, count]) => (
          <button key={field} className={`rounded-full px-3 py-1.5 text-xs font-black ${selectedField === field ? "bg-[var(--green-600)] text-white" : "bg-[var(--mist)] text-[var(--navy-800)]"}`} onClick={() => onFieldSelect(field)}>
            <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: fieldMeta[field].color }} />
            {field} {count}
          </button>
        ))}
      </div>
    </div>
  );
}

function InitiativesPage({
  isAuthed,
  mode,
  setMode,
  items,
  form,
  formMessage,
  editingId,
  selectedDepartment,
  selectedField,
  selectedStatus,
  searchQuery,
  setSelectedDepartment,
  setSelectedField,
  setSelectedStatus,
  setSearchQuery,
  filterSummary,
  clearFilters,
  updateForm,
  authorMode,
  onModeChange,
  updateAuthor,
  addAuthor,
  removeAuthor,
  submitInitiative,
  exportDocx,
  clearForm,
  openDetails,
  likeInitiative,
  editInitiative,
  showWordPreview,
  login,
  tablePulse,
}: {
  isAuthed: boolean;
  mode: "list" | "form";
  setMode: (mode: "list" | "form") => void;
  items: Initiative[];
  form: FormState;
  formMessage: string;
  editingId: number | null;
  selectedDepartment: string;
  selectedField: string;
  selectedStatus: string;
  searchQuery: string;
  setSelectedDepartment: (value: string) => void;
  setSelectedField: (value: string) => void;
  setSelectedStatus: (value: string) => void;
  setSearchQuery: (value: string) => void;
  filterSummary: { key: string; label: string; value: string }[];
  clearFilters: () => void;
  updateForm: (key: keyof FormState, value: string) => void;
  authorMode: AuthorMode;
  onModeChange: (mode: AuthorMode) => void;
  updateAuthor: (index: number, field: keyof AuthorEntry, value: string) => void;
  addAuthor: () => void;
  removeAuthor: (index: number) => void;
  submitInitiative: (event: FormEvent<HTMLFormElement>) => void;
  exportDocx: () => void;
  clearForm: () => void;
  openDetails: (item: Initiative) => void;
  likeInitiative: (id: number) => void;
  editInitiative: (item: Initiative) => void;
  showWordPreview: () => void;
  login: () => void;
  tablePulse: boolean;
}) {
  if (!isAuthed) {
    return (
    <PageFrame eyebrow="Sáng kiến" title="Đăng nhập để gửi và xem chi tiết sáng kiến" variant="campaign">
        <AuthGatePanel
          title="Bạn đang xem bản public"
          description="Danh sách dưới đây chỉ hiển thị tóm tắt. Đăng nhập tài khoản Tập đoàn để tạo sáng kiến, xem chi tiết, hỏi AI và thể hiện quan tâm."
          action="Đăng nhập để gửi sáng kiến"
          onAction={login}
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.slice(0, 6).map((item) => (
            <InitiativeCard key={item.id} item={item} canOpen={false} onOpen={openDetails} />
          ))}
        </div>
      </PageFrame>
    );
  }

  if (mode === "form") {
    return (
      <PageFrame eyebrow="Trình tạo Sáng kiến" title={editingId ? "Chỉnh sửa sáng kiến" : "Biểu mẫu đăng ký sáng kiến"} variant="campaign">
        <InitiativeForm
          form={form}
          formMessage={formMessage}
          editingId={editingId}
          updateForm={updateForm}
          authorMode={authorMode}
          onModeChange={onModeChange}
          updateAuthor={updateAuthor}
          addAuthor={addAuthor}
          removeAuthor={removeAuthor}
          submitInitiative={submitInitiative}
          exportDocx={exportDocx}
          clearForm={clearForm}
          showWordPreview={showWordPreview}
          backToList={() => setMode("list")}
        />
      </PageFrame>
    );
  }

  const mine = items.filter((item) => item.cuaToi).slice(0, 4);

  return (
    <PageFrame eyebrow="Sáng kiến" title="Danh sách và sáng kiến của tôi" variant="campaign">
      <FilterBar
        selectedDepartment={selectedDepartment}
        selectedField={selectedField}
        selectedStatus={selectedStatus}
        searchQuery={searchQuery}
        setSelectedDepartment={setSelectedDepartment}
        setSelectedField={setSelectedField}
        setSelectedStatus={setSelectedStatus}
        setSearchQuery={setSearchQuery}
        filterSummary={filterSummary}
        clearFilters={clearFilters}
      />
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className={`card overflow-hidden rounded-xl transition ${tablePulse ? "ring-4 ring-[var(--cyan-100)]" : ""}`}>
          <div className="flex flex-col gap-3 border-b border-[var(--line)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-black">Bảng thống kê sáng kiến</h3>
              <p className="text-sm font-semibold text-[var(--muted)]">{items.length} sáng kiến phù hợp bộ lọc</p>
            </div>
            <button className="rounded-md bg-[var(--green-600)] px-4 py-2 text-sm font-black text-white" onClick={() => setMode("form")}>
              Tạo sáng kiến mới
            </button>
          </div>
          <InitiativeTable items={items} openDetails={openDetails} likeInitiative={likeInitiative} />
        </section>
        <aside className="grid content-start gap-4">
          <div className="campaign-panel rounded-xl p-5">
            <h3 className="font-black">Sáng kiến của tôi</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Xem lại và chỉnh sửa các sáng kiến bạn đã nhập trong prototype.</p>
            <div className="mt-4 space-y-3">
              {(mine.length > 0 ? mine : items.slice(0, 3)).map((item) => (
                <button key={item.id} className="w-full rounded-lg border border-[var(--line)] p-3 text-left" onClick={() => editInitiative(item)}>
                  <p className="line-clamp-2 text-sm font-black">{item.ten}</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{item.trangThai} • {item.ngayNop}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="note-card rounded-xl p-5">
            <Bot className="h-8 w-8 text-[var(--green-600)]" />
            <h3 className="mt-3 font-black">Bí ý tưởng?</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--navy-800)]">Mở Trợ lý AI ở góc màn hình để nhận gợi ý theo dữ liệu sáng kiến mẫu.</p>
          </div>
        </aside>
      </div>
    </PageFrame>
  );
}

function InsightsDataPanel({
  isAuthed,
  items,
  initiatives,
  totals,
  departmentCounts,
  fieldCounts,
  leaderBoard,
  selectedDepartment,
  selectedField,
  selectedStatus,
  searchQuery,
  setSelectedDepartment,
  setSelectedField,
  setSelectedStatus,
  setSearchQuery,
  filterSummary,
  clearFilters,
  applyChartFilter,
  openDetails,
  likeInitiative,
  login,
  tablePulse,
}: {
  isAuthed: boolean;
  items: Initiative[];
  initiatives: Initiative[];
  totals: { approved: number; pending: number; interests: number; topField: Field };
  departmentCounts: [string, number][];
  fieldCounts: readonly (readonly [Field, number])[];
  leaderBoard: { ten: string; donVi: string; soSangKien: number }[];
  selectedDepartment: string;
  selectedField: string;
  selectedStatus: string;
  searchQuery: string;
  setSelectedDepartment: (value: string) => void;
  setSelectedField: (value: string) => void;
  setSelectedStatus: (value: string) => void;
  setSearchQuery: (value: string) => void;
  filterSummary: { key: string; label: string; value: string }[];
  clearFilters: () => void;
  applyChartFilter: (kind: FilterKind, value: string, targetView?: View) => void;
  openDetails: (item: Initiative) => void;
  likeInitiative: (id: number) => void;
  login: () => void;
  tablePulse: boolean;
}) {
  if (!isAuthed) {
    return (
      <AuthGatePanel
        title="Bảng dữ liệu chi tiết chỉ dành cho người đăng nhập"
        description="Đăng nhập để xem dashboard chi tiết, bảng sáng kiến và dữ liệu quan tâm theo bộ lọc."
        action="Đăng nhập để xem bảng dữ liệu"
        onAction={login}
      />
    );
  }

  return (
    <>
      <FilterBar
        selectedDepartment={selectedDepartment}
        selectedField={selectedField}
        selectedStatus={selectedStatus}
        searchQuery={searchQuery}
        setSelectedDepartment={setSelectedDepartment}
        setSelectedField={setSelectedField}
        setSelectedStatus={setSelectedStatus}
        setSearchQuery={setSearchQuery}
        filterSummary={filterSummary}
        clearFilters={clearFilters}
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile icon={Lightbulb} value={String(initiatives.length)} label="Tổng sáng kiến" caption="Tất cả dữ liệu" color="var(--green-600)" card />
        <StatTile icon={ShieldCheck} value={String(totals.approved)} label="Đã duyệt" caption="Sẵn sàng lan tỏa" color="var(--blue-700)" card />
        <StatTile icon={FileText} value={String(totals.pending)} label="Chờ duyệt" caption="Cần xử lý" color="var(--gold-500)" card />
        <StatTile icon={Heart} value={String(totals.interests)} label="Lượt quan tâm" caption="Tổng cộng" color="var(--green-500)" card />
        <StatTile icon={Sparkles} value={totals.topField} label="Lĩnh vực nổi bật" caption="Theo bộ lọc" color="var(--cyan-500)" card />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-12">
        <ChartPanel className="lg:col-span-4" title="Sáng kiến theo Ban/Văn phòng">
          <div className="space-y-3">
            {departmentCounts.slice(0, 8).map(([name, count], index) => (
              <LeaderboardRow key={name} index={index + 1} name={name} value={count} active={selectedDepartment === name} max={Math.max(...departmentCounts.map(([, c]) => c), 1)} onClick={() => applyChartFilter("department", name)} />
            ))}
          </div>
        </ChartPanel>
        <ChartPanel className="lg:col-span-4" title="Lĩnh vực / wordcloud">
          <WordCloud selectedField={selectedField} onSelect={(field) => applyChartFilter("field", field)} />
          <DonutChart total={items.length} fieldCounts={fieldCounts} compact selectedField={selectedField} onFieldSelect={(field) => applyChartFilter("field", field)} />
        </ChartPanel>
        <ChartPanel className="lg:col-span-4" title="Mối quan tâm theo tác giả">
          <div className="space-y-3">
            {leaderBoard.map((person, index) => (
              <LeaderboardRow key={person.ten} index={index + 1} name={person.ten} value={person.soSangKien} active={searchQuery === person.ten} max={Math.max(...leaderBoard.map((p) => p.soSangKien), 1)} onClick={() => applyChartFilter("author", person.ten)} />
            ))}
          </div>
        </ChartPanel>
      </div>
      <div className={`mt-5 card overflow-hidden rounded-xl transition ${tablePulse ? "ring-4 ring-[var(--cyan-100)]" : ""}`}>
        <InitiativeTable items={items} openDetails={openDetails} likeInitiative={likeInitiative} />
      </div>
    </>
  );
}

function CompetitionPage({
  isAuthed,
  activeTab,
  setActiveTab,
  range,
  setRange,
  items,
  initiatives,
  totals,
  departmentCounts,
  fieldCounts,
  leaderBoard,
  selectedDepartment,
  selectedField,
  selectedStatus,
  searchQuery,
  setSelectedDepartment,
  setSelectedField,
  setSelectedStatus,
  setSearchQuery,
  filterSummary,
  clearFilters,
  openDetails,
  likeInitiative,
  applyChartFilter,
  login,
  tablePulse,
}: {
  isAuthed: boolean;
  activeTab: InsightsTab;
  setActiveTab: (tab: InsightsTab) => void;
  range: string;
  setRange: (value: string) => void;
  items: Initiative[];
  initiatives: Initiative[];
  totals: { approved: number; pending: number; interests: number; topField: Field };
  departmentCounts: [string, number][];
  fieldCounts: readonly (readonly [Field, number])[];
  leaderBoard: { ten: string; donVi: string; soSangKien: number }[];
  selectedDepartment: string;
  selectedField: string;
  selectedStatus: string;
  searchQuery: string;
  setSelectedDepartment: (value: string) => void;
  setSelectedField: (value: string) => void;
  setSelectedStatus: (value: string) => void;
  setSearchQuery: (value: string) => void;
  filterSummary: { key: string; label: string; value: string }[];
  clearFilters: () => void;
  openDetails: (item: Initiative) => void;
  likeInitiative: (id: number) => void;
  applyChartFilter: (kind: FilterKind, value: string, targetView?: View) => void;
  login: () => void;
  tablePulse: boolean;
}) {
  const topInitiatives = initiatives.slice().sort((a, b) => b.quanTam - a.quanTam).slice(0, 6);
  const awards = initiatives.filter((item) => item.giaiThuong !== "Chờ xét chọn").slice(0, 4);
  const podium = departmentCounts.slice(0, 3);
  const spotlight = topInitiatives[0];
  const maxDepartment = Math.max(...departmentCounts.map(([, count]) => count), 1);
  const insightTabs: { id: InsightsTab; label: string }[] = [
    { id: "overview", label: "Tổng quan" },
    { id: "competition", label: "Bảng thi đua" },
    { id: "data", label: "Dữ liệu sáng kiến" },
  ];

  return (
    <PageFrame eyebrow="Thi đua & Thống kê" title="Phong trào sáng kiến Công đoàn Công ty Mẹ" variant="campaign">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">Theo dõi sức nóng phong trào, các chỉ số đổi mới và bảng xếp hạng thi đua trong một không gian thống nhất.</p>
        {isAuthed ? (
          <select className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-black" value={range} onChange={(event) => setRange(event.target.value)}>
            {["Tháng này", "Quý này", "Năm nay"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        ) : (
          <button className="rounded-md bg-[var(--green-600)] px-4 py-2 text-sm font-black text-white" onClick={login}>
            Đăng nhập để xem chi tiết
          </button>
        )}
      </div>
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-[var(--line)] bg-white/80 p-1 shadow-sm">
        {insightTabs.map((tab) => (
          <button
            key={tab.id}
            className={`min-h-11 rounded-lg px-4 py-2 text-sm font-black transition ${activeTab === tab.id ? "bg-[var(--navy-900)] text-white shadow-md shadow-[var(--navy-900)]/12" : "text-[var(--navy-800)] hover:bg-[var(--mist)]"}`}
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "overview" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatTile icon={Lightbulb} value={String(initiatives.length)} label="Tổng sáng kiến" caption="Toàn bộ phong trào" color="var(--green-600)" card />
            <StatTile icon={ShieldCheck} value={String(totals.approved)} label="Đã duyệt" caption="Sẵn sàng lan tỏa" color="var(--blue-700)" card />
            <StatTile icon={FileText} value={String(totals.pending)} label="Chờ duyệt" caption="Cần xử lý" color="var(--gold-500)" card />
            <StatTile icon={Heart} value={compactNumber(totals.interests)} label="Lượt quan tâm" caption="Tổng cộng" color="var(--green-500)" card />
            <StatTile icon={Sparkles} value={totals.topField} label="Lĩnh vực nổi bật" caption="Theo bộ lọc" color="var(--cyan-500)" card />
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="landing-dashboard rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-black text-[var(--navy-900)]">Sáng kiến theo lĩnh vực</h3>
                <button className="text-xs font-black text-[var(--blue-700)]" onClick={() => setActiveTab("data")}>Xem dữ liệu</button>
              </div>
              <FieldFlowChart total={initiatives.length} fieldCounts={fieldCounts} selectedField={selectedField} onFieldSelect={(field) => applyChartFilter("field", field, "stats")} />
            </section>
            <section className="landing-dashboard rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-black text-[var(--navy-900)]">Top Ban/Văn phòng</h3>
                <button className="text-xs font-black text-[var(--blue-700)]" onClick={() => setActiveTab("competition")}>Xem thi đua</button>
              </div>
              <div className="mt-5 space-y-3">
                {departmentCounts.slice(0, 6).map(([name, count], index) => (
                  <LeaderboardRow
                    key={name}
                    index={index + 1}
                    name={name}
                    value={count}
                    max={maxDepartment}
                    active={selectedDepartment === name}
                    onClick={() => applyChartFilter("department", name, "stats")}
                  />
                ))}
              </div>
            </section>
          </div>
          <section className="mt-6">
            <SectionTitle title="Sáng kiến được quan tâm" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {topInitiatives.slice(0, 3).map((item) => (
                <InitiativeCard key={item.id} item={item} canOpen={isAuthed} onOpen={openDetails} />
              ))}
            </div>
          </section>
        </>
      )}
      {activeTab === "competition" && (
        <>
      <div className="mb-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <section className="campaign-panel rounded-xl p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl font-black text-[var(--navy-900)]">Podium thi đua Ban/Văn phòng</h3>
            <Pill tone="gold">{range}</Pill>
          </div>
          <div className="mt-5 grid items-end gap-3 sm:grid-cols-3">
            {podium.map(([name, count], index) => (
              <button
                key={name}
                className={`rounded-xl border border-[var(--line)] bg-white p-4 text-left transition hover:-translate-y-0.5 ${index === 0 ? "sm:order-2 sm:min-h-48" : index === 1 ? "sm:order-1 sm:min-h-40" : "sm:order-3 sm:min-h-36"}`}
                onClick={() => applyChartFilter("department", name, "stats")}
              >
                <div className={`grid h-10 w-10 place-items-center rounded-full text-lg font-black ${index === 0 ? "bg-[var(--gold-500)] text-white" : "bg-[var(--green-100)] text-[var(--green-700)]"}`}>{index + 1}</div>
                <p className="mt-4 line-clamp-2 font-black">{name}</p>
                <p className="mt-3 text-3xl font-black text-[var(--green-600)]">{count}</p>
                <p className="text-xs font-bold text-[var(--muted)]">sáng kiến</p>
              </button>
            ))}
          </div>
        </section>
        {spotlight && (
          <section className="campaign-panel relative overflow-hidden rounded-xl p-5">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(29,190,214,0.12))]" />
            <div className="relative">
              <div className="mb-3 flex flex-wrap gap-2">
                <Pill tone="gold">Sáng kiến tiêu biểu</Pill>
                <Pill field={spotlight.linhVuc}>{spotlight.linhVuc}</Pill>
              </div>
              <h3 className="text-2xl font-black leading-tight text-[var(--navy-900)]">{spotlight.ten}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{spotlight.tomTat}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric label="Quan tâm" value={String(spotlight.quanTam)} />
                <Metric label="Điểm thi đua" value={String(spotlight.diem)} />
              </div>
              <button className="mt-5 rounded-md bg-[var(--green-600)] px-4 py-3 text-sm font-black text-white" onClick={() => openDetails(spotlight)}>
                Xem sáng kiến
              </button>
            </div>
          </section>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartPanel title="Top Ban/Văn phòng">
          {departmentCounts.slice(0, 6).map(([name, count], index) => (
            <LeaderboardRow key={name} index={index + 1} name={name} value={count} max={Math.max(...departmentCounts.map(([, c]) => c), 1)} onClick={() => applyChartFilter("department", name, "stats")} />
          ))}
        </ChartPanel>
        <ChartPanel title="Top cá nhân">
          <div className="space-y-3">
            {leaderBoard.map((person, index) => (
              <button key={person.ten} className="flex w-full items-center gap-3 rounded-lg bg-[var(--mist)] p-3 text-left" onClick={() => applyChartFilter("author", person.ten, "stats")}>
                <Avatar name={person.ten} index={index} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">{person.ten}</p>
                  <p className="truncate text-xs font-semibold text-[var(--muted)]">{person.donVi}</p>
                </div>
                <span className="font-black">{person.soSangKien}</span>
              </button>
            ))}
          </div>
        </ChartPanel>
        <ChartPanel title="Phase 2: điểm thưởng">
          <div className="space-y-3">
            {["Điểm thưởng", "Token/Coins", "Hội đồng đánh giá"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg border border-[var(--line)] p-3">
                <span className="font-black">{item}</span>
                <Pill tone="gold">Phase 2</Pill>
              </div>
            ))}
          </div>
        </ChartPanel>
      </div>
      {isAuthed && (
        <section className="mt-6">
          <SectionTitle title="Sáng kiến tiêu biểu" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {awards.map((item) => (
              <InitiativeCard key={item.id} item={item} canOpen={isAuthed} onOpen={openDetails} />
            ))}
          </div>
        </section>
      )}
      <section className="mt-6">
        <SectionTitle title="Top sáng kiến được quan tâm" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {topInitiatives.map((item) => (
            <InitiativeCard key={item.id} item={item} canOpen={isAuthed} onOpen={openDetails} />
          ))}
        </div>
      </section>
        </>
      )}
      {activeTab === "data" && (
        <InsightsDataPanel
          isAuthed={isAuthed}
          items={items}
          initiatives={initiatives}
          totals={totals}
          departmentCounts={departmentCounts}
          fieldCounts={fieldCounts}
          leaderBoard={leaderBoard}
          selectedDepartment={selectedDepartment}
          selectedField={selectedField}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
          setSelectedDepartment={setSelectedDepartment}
          setSelectedField={setSelectedField}
          setSelectedStatus={setSelectedStatus}
          setSearchQuery={setSearchQuery}
          filterSummary={filterSummary}
          clearFilters={clearFilters}
          applyChartFilter={applyChartFilter}
          openDetails={openDetails}
          likeInitiative={likeInitiative}
          login={login}
          tablePulse={tablePulse}
        />
      )}
    </PageFrame>
  );
}

function GuidePage({
  isAuthed,
  startCreate,
  openChat,
  login,
}: {
  isAuthed: boolean;
  startCreate: () => void;
  openChat: () => void;
  login: () => void;
}) {
  const steps = [
    { title: "Tìm cảm hứng", text: "Xem thống kê, bảng thi đua và các sáng kiến được quan tâm." },
    { title: "Tạo sáng kiến", text: "Điền form ngắn gọn, thêm đồng tác giả và mô tả hiệu quả dự kiến." },
    { title: "Xuất DOCX / Gửi duyệt", text: "Xem preview bản Word, tải DOCX và gửi dữ liệu vào kho quản trị." },
  ];
  const faqs = [
    ["Ai được gửi sáng kiến?", "Công đoàn viên và người lao động sử dụng tài khoản Tập đoàn trong prototype."],
    ["Có cần đăng nhập không?", "Có. Người chưa đăng nhập chỉ xem được landing page và thống kê cơ bản."],
    ["DOCX dùng để làm gì?", "DOCX mô phỏng mẫu chuẩn để in ấn, ký tá hoặc lưu hồ sơ khi cần."],
    ["Sáng kiến được duyệt như thế nào?", "Prototype ghi trạng thái Chờ duyệt; luồng hội đồng đánh giá được để Phase 2."],
  ];

  return (
    <PageFrame eyebrow="Hướng dẫn" title="Tham gia phong trào sáng kiến trong 3 bước" variant="campaign">
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="note-card rounded-xl p-5">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--green-100)] text-lg font-black text-[var(--green-700)]">{index + 1}</div>
            <h3 className="mt-4 text-lg font-black">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="campaign-panel rounded-xl p-5">
          <h3 className="text-xl font-black">Câu hỏi thường gặp</h3>
          <div className="mt-4 divide-y divide-[var(--line)]">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group py-4">
                <summary className="cursor-pointer font-black">{question}</summary>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
        <div className="note-card rounded-xl p-5">
          <Bot className="h-9 w-9 text-[var(--blue-700)]" />
          <h3 className="mt-4 text-xl font-black">Gợi ý với AI</h3>
          <div className="mt-4 grid gap-2">
            <button className="rounded-lg bg-white p-3 text-left text-sm font-black text-[var(--navy-900)]" onClick={isAuthed ? openChat : login}>
              Gợi ý cho tôi sáng kiến về tiết kiệm KHCN-ĐMST
            </button>
            <button className="rounded-lg bg-white p-3 text-left text-sm font-black text-[var(--navy-900)]" onClick={isAuthed ? openChat : login}>
              Ban Quản trị nguồn nhân lực thì nên làm sáng kiến gì?
            </button>
          </div>
          <button className="mt-5 rounded-md bg-[var(--green-600)] px-4 py-2 text-sm font-black text-white" onClick={isAuthed ? startCreate : login}>
            {isAuthed ? "Tạo sáng kiến" : "Đăng nhập để hỏi AI"}
          </button>
        </div>
      </div>
    </PageFrame>
  );
}

function AdminPortal({
  items,
  department,
  field,
  status,
  setDepartment,
  setField,
  setStatus,
  searchQuery,
  setSearchQuery,
  exportCsv,
  openDetails,
  changeStatus,
}: {
  items: Initiative[];
  department: string;
  field: string;
  status: string;
  setDepartment: (value: string) => void;
  setField: (value: string) => void;
  setStatus: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  exportCsv: () => void;
  openDetails: (item: Initiative) => void;
  changeStatus: (id: number, status: Status) => void;
}) {
  const approved = items.filter((item) => item.trangThai === "Đã duyệt").length;
  const interests = items.reduce((sum, item) => sum + item.quanTam, 0);
  const authors = new Set(items.map((item) => item.tacGia)).size;

  return (
    <PageFrame eyebrow="Admin Portal" title="Kho dữ liệu Sáng kiến">
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={FileText} value={String(items.length)} label="Sáng kiến trong kho" caption="Theo bộ lọc hiện tại" color="var(--blue-700)" card />
        <StatTile icon={ShieldCheck} value={String(approved)} label="Đã duyệt" caption="Có thể lan tỏa" color="var(--green-600)" card />
        <StatTile icon={Heart} value={String(interests)} label="Lượt quan tâm" caption="Tín hiệu thị hiếu" color="var(--green-500)" card />
        <StatTile icon={Users} value={String(authors)} label="Tác giả" caption="Cá nhân tham gia" color="var(--gold-500)" card />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="card overflow-hidden rounded-xl">
          <div className="grid gap-3 border-b border-[var(--line)] p-4 md:grid-cols-5">
            <Select label="Phòng ban" value={department} onChange={setDepartment} options={["Tất cả", ...departments]} />
            <Select label="Lĩnh vực" value={field} onChange={setField} options={["Tất cả", ...fields]} />
            <Select label="Trạng thái" value={status} onChange={setStatus} options={statuses} />
            <label>
              <span className="text-xs font-black uppercase text-[var(--muted)]">Tìm kiếm</span>
              <input className="mt-2 w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm font-bold outline-none focus:border-[var(--green-600)]" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tên, tác giả, đơn vị..." />
            </label>
            <button className="rounded-md bg-[var(--green-600)] px-4 py-3 text-sm font-black text-white" onClick={exportCsv}>
              Export Excel/CSV
            </button>
          </div>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-[var(--navy-900)] text-white">
                <tr>
                  {["Tên sáng kiến", "Lĩnh vực", "Đơn vị", "Tác giả", "Trạng thái", "Quan tâm", "Điểm", "Giải thưởng", "Thao tác"].map((head) => (
                    <th key={head} className="px-4 py-3">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-[var(--line)]">
                    <td className="px-4 py-3 font-black">{item.ten}</td>
                    <td className="px-4 py-3"><Pill field={item.linhVuc}>{item.linhVuc}</Pill></td>
                    <td className="px-4 py-3">{item.donVi}</td>
                    <td className="px-4 py-3">{item.tacGia}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.trangThai} /></td>
                    <td className="px-4 py-3">{item.quanTam}</td>
                    <td className="px-4 py-3">{item.diem}</td>
                    <td className="px-4 py-3">{item.giaiThuong}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="rounded-md bg-[var(--blue-100)] px-3 py-2 text-xs font-black text-[var(--blue-700)]" onClick={() => openDetails(item)}>Xem</button>
                        <button className="rounded-md bg-[var(--green-100)] px-3 py-2 text-xs font-black text-[var(--green-700)]" onClick={() => changeStatus(item.id, item.trangThai === "Đã duyệt" ? "Chờ duyệt" : "Đã duyệt")}>
                          {item.trangThai === "Đã duyệt" ? "Chờ duyệt" : "Duyệt"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 p-4 lg:hidden">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border border-[var(--line)] p-4">
                <p className="font-black">{item.ten}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{item.tacGia} • {item.donVi}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill field={item.linhVuc}>{item.linhVuc}</Pill>
                  <StatusBadge status={item.trangThai} />
                  <Pill tone="gold">{item.giaiThuong}</Pill>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button className="rounded-md bg-[var(--blue-100)] px-3 py-2 text-xs font-black text-[var(--blue-700)]" onClick={() => openDetails(item)}>Xem chi tiết</button>
                  <button className="rounded-md bg-[var(--green-100)] px-3 py-2 text-xs font-black text-[var(--green-700)]" onClick={() => changeStatus(item.id, item.trangThai === "Đã duyệt" ? "Chờ duyệt" : "Đã duyệt")}>
                    {item.trangThai === "Đã duyệt" ? "Chờ duyệt" : "Duyệt"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <aside className="grid content-start gap-4">
          <AdminInsight icon={Users} title="Quản trị người dùng" text="Theo dõi nhóm người dùng, vai trò và quyền truy cập." />
          <AdminInsight icon={Heart} title="Thị hiếu quan tâm" text="Quan sát lĩnh vực, đơn vị và sáng kiến được hưởng ứng." />
          <AdminInsight icon={Trophy} title="Tag giải thưởng" text="Chuẩn bị nhãn Giải Nhất/Nhì/Ba và Sáng kiến tiêu biểu." phase2 />
        </aside>
      </div>
    </PageFrame>
  );
}

function InitiativeForm({
  form,
  formMessage,
  editingId,
  updateForm,
  authorMode,
  onModeChange,
  updateAuthor,
  addAuthor,
  removeAuthor,
  submitInitiative,
  exportDocx,
  clearForm,
  showWordPreview,
  backToList,
}: {
  form: FormState;
  formMessage: string;
  editingId: number | null;
  updateForm: (key: keyof FormState, value: string) => void;
  authorMode: AuthorMode;
  onModeChange: (mode: AuthorMode) => void;
  updateAuthor: (index: number, field: keyof AuthorEntry, value: string) => void;
  addAuthor: () => void;
  removeAuthor: (index: number) => void;
  submitInitiative: (event: FormEvent<HTMLFormElement>) => void;
  exportDocx: () => void;
  clearForm: () => void;
  showWordPreview: () => void;
  backToList: () => void;
}) {
  const formSteps = [
    {
      title: "Thông tin chung",
      done: Boolean(form.ten.trim() && form.email.trim() && form.donVi),
    },
    {
      title: "Tác giả",
      done: form.danhSachTacGia.every((author) => author.hoTen.trim()),
    },
    {
      title: "Nội dung",
      done: Boolean(form.lyDo.trim() && form.mucTieu.trim() && form.giaiPhap.trim()),
    },
    {
      title: "Hiệu quả",
      done: Boolean(form.hieuQua.trim() && form.tinhMoi.trim()),
    },
    {
      title: "Preview/Gửi",
      done: formMessage.startsWith("Đã gửi") || formMessage.startsWith("Đã cập nhật"),
    },
  ];

  return (
    <section>
      <form className="card overflow-hidden" onSubmit={submitInitiative}>
        <div className="border-b border-[var(--line)] bg-white px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-black text-[var(--navy-900)]">Thông tin chung</h3>
            <StatusBadge status="Chờ duyệt" />
          </div>
        </div>

        <div className="border-b border-[var(--line)] bg-[var(--mist)] px-5 py-4 sm:px-7">
          <div className="grid gap-2 sm:grid-cols-5">
            {formSteps.map((step, index) => (
              <div key={step.title} className={`rounded-lg border px-3 py-3 ${step.done ? "border-[var(--green-500)] bg-white" : "border-[var(--line)] bg-white/65"}`}>
                <div className="flex items-center gap-2">
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-black ${step.done ? "bg-[var(--green-600)] text-white" : "bg-[var(--blue-100)] text-[var(--blue-700)]"}`}>
                    {index + 1}
                  </span>
                  <span className="min-w-0 truncate text-xs font-black text-[var(--navy-900)]">{step.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-x-5 gap-y-5 px-5 py-6 sm:px-7 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-black text-[var(--navy-900)]">Tên sáng kiến</span>
            <input
              className="mt-2 w-full rounded-md border border-[var(--line)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--green-600)] focus:ring-4 focus:ring-[var(--green-100)]"
              value={form.ten}
              onChange={(event) => updateForm("ten", event.target.value)}
              placeholder="Ví dụ: Tối ưu tiêu thụ năng lượng tại văn phòng"
            />
          </label>

          <label className="block">
            <span className="text-sm font-black text-[var(--navy-900)]">Lĩnh vực</span>
            <select
              className="mt-2 w-full rounded-md border border-[var(--line)] bg-white px-4 py-3 text-base font-bold text-[var(--navy-800)] outline-none transition focus:border-[var(--green-600)] focus:ring-4 focus:ring-[var(--green-100)]"
              value={form.linhVuc}
              onChange={(event) => updateForm("linhVuc", event.target.value)}
            >
              {fields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-black text-[var(--navy-900)]">Đơn vị/Phòng ban</span>
            <select
              className="mt-2 w-full rounded-md border border-[var(--line)] bg-white px-4 py-3 text-base font-bold text-[var(--navy-800)] outline-none transition focus:border-[var(--green-600)] focus:ring-4 focus:ring-[var(--green-100)]"
              value={form.donVi}
              onChange={(event) => updateForm("donVi", event.target.value)}
            >
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-black text-[var(--navy-900)]">Email liên hệ</span>
            <input
              className="mt-2 w-full rounded-md border border-[var(--line)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--green-600)] focus:ring-4 focus:ring-[var(--green-100)]"
              value={form.email}
              onChange={(event) => updateForm("email", event.target.value)}
              placeholder="name@pvn.vn"
              type="email"
            />
          </label>

          <label className="block">
            <span className="text-sm font-black text-[var(--navy-900)]">Thời gian bắt đầu</span>
            <input
              className="mt-2 w-full rounded-md border border-[var(--line)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--green-600)] focus:ring-4 focus:ring-[var(--green-100)]"
              value={form.thoiGianTu}
              onChange={(event) => updateForm("thoiGianTu", event.target.value)}
              type="date"
            />
          </label>

          <label className="block">
            <span className="text-sm font-black text-[var(--navy-900)]">Thời gian kết thúc</span>
            <input
              className="mt-2 w-full rounded-md border border-[var(--line)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--green-600)] focus:ring-4 focus:ring-[var(--green-100)]"
              value={form.thoiGianDen}
              onChange={(event) => updateForm("thoiGianDen", event.target.value)}
              type="date"
            />
          </label>
        </div>

        <div className="border-y border-[var(--line)] bg-[var(--mist)] px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-black text-[var(--navy-900)]">Tác giả và đơn vị</h3>
              <p className="mt-1 text-sm font-semibold text-[var(--muted)]">Chọn cá nhân hoặc nhóm đồng tác giả cho sáng kiến.</p>
            </div>
            <div className="inline-grid w-full grid-cols-2 rounded-lg border border-[var(--line)] bg-white p-1 sm:w-auto">
              <button
                className={`rounded-md px-4 py-2 text-sm font-black ${authorMode === "solo" ? "bg-[var(--green-600)] text-white" : "text-[var(--navy-800)]"}`}
                type="button"
                onClick={() => onModeChange("solo")}
              >
                Cá nhân
              </button>
              <button
                className={`rounded-md px-4 py-2 text-sm font-black ${authorMode === "team" ? "bg-[var(--green-600)] text-white" : "text-[var(--navy-800)]"}`}
                type="button"
                onClick={() => onModeChange("team")}
              >
                Nhóm
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {form.danhSachTacGia.map((author, index) => (
              <div key={index} className="grid gap-3 rounded-lg border border-[var(--line)] bg-white p-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-black text-[var(--navy-900)]">{index === 0 ? "Tác giả chính" : `Đồng tác giả ${index}`}</span>
                  <input
                    className="mt-2 w-full rounded-md border border-[var(--line)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--green-600)] focus:ring-4 focus:ring-[var(--green-100)]"
                    value={author.hoTen}
                    onChange={(event) => updateAuthor(index, "hoTen", event.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-black text-[var(--navy-900)]">Chức vụ</span>
                  <input
                    className="mt-2 w-full rounded-md border border-[var(--line)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--green-600)] focus:ring-4 focus:ring-[var(--green-100)]"
                    value={author.chucVu}
                    onChange={(event) => updateAuthor(index, "chucVu", event.target.value)}
                    placeholder="Ví dụ: Chuyên viên"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-black text-[var(--navy-900)]">Đơn vị</span>
                  <select
                    className="mt-2 w-full rounded-md border border-[var(--line)] bg-white px-4 py-3 text-base font-bold text-[var(--navy-800)] outline-none transition focus:border-[var(--green-600)] focus:ring-4 focus:ring-[var(--green-100)]"
                    value={author.donVi}
                    onChange={(event) => updateAuthor(index, "donVi", event.target.value)}
                  >
                    <option value="">Chọn đơn vị</option>
                    {DEPARTMENTS.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-black text-[var(--navy-900)]">Email</span>
                  <div className="mt-2 flex gap-2">
                    <input
                      className="min-w-0 flex-1 rounded-md border border-[var(--line)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--green-600)] focus:ring-4 focus:ring-[var(--green-100)]"
                      value={author.email}
                      onChange={(event) => updateAuthor(index, "email", event.target.value)}
                      placeholder="name@pvn.vn"
                      type="email"
                    />
                    {authorMode === "team" && index > 0 && (
                      <button
                        className="rounded-md border border-[var(--line)] px-3 py-2 text-sm font-black text-[var(--navy-800)]"
                        type="button"
                        onClick={() => removeAuthor(index)}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </label>
              </div>
            ))}
            {authorMode === "team" && (
              <button
                className="w-fit rounded-md border border-[var(--green-600)] px-4 py-3 text-sm font-black text-[var(--green-700)]"
                type="button"
                onClick={addAuthor}
              >
                Thêm đồng tác giả
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-5 px-5 py-6 sm:px-7">
          <TextArea
            label="Lý do đề xuất"
            value={form.lyDo}
            onChange={(value) => updateForm("lyDo", value)}
            placeholder="Vấn đề, nhu cầu hoặc cơ hội cải tiến cần được giải quyết..."
          />
          <TextArea
            label="Mục tiêu"
            value={form.mucTieu}
            onChange={(value) => updateForm("mucTieu", value)}
            placeholder="Mục tiêu cụ thể của sáng kiến..."
          />
          <TextArea
            label="Thực trạng"
            value={form.thucTrang}
            onChange={(value) => updateForm("thucTrang", value)}
            placeholder="Mô tả quy trình, dữ liệu hoặc tình huống hiện tại..."
          />
          <TextArea
            label="Giải pháp mới"
            value={form.giaiPhap}
            onChange={(value) => updateForm("giaiPhap", value)}
            placeholder="Nêu giải pháp, điểm mới, công nghệ hoặc cách làm đề xuất..."
          />
          <TextArea
            label="Cách thức áp dụng"
            value={form.cachThuc}
            onChange={(value) => updateForm("cachThuc", value)}
            placeholder="Các bước triển khai, phạm vi áp dụng và đơn vị phối hợp..."
          />
          <TextArea
            label="Nội dung tóm tắt"
            value={form.tomTat}
            onChange={(value) => updateForm("tomTat", value)}
            placeholder="Tóm tắt ngắn để hiển thị trên dashboard..."
          />
          <TextArea
            label="Hiệu quả dự kiến"
            value={form.hieuQua}
            onChange={(value) => updateForm("hieuQua", value)}
            placeholder="Hiệu quả về chi phí, thời gian, an toàn, môi trường hoặc chất lượng phục vụ đoàn viên..."
          />
          <TextArea
            label="Tính mới"
            value={form.tinhMoi}
            onChange={(value) => updateForm("tinhMoi", value)}
            placeholder="Điểm khác biệt so với cách làm hiện tại..."
          />
          <TextArea
            label="Khả năng nhân rộng"
            value={form.nhanRong}
            onChange={(value) => updateForm("nhanRong", value)}
            placeholder="Điều kiện và phạm vi có thể nhân rộng..."
          />
          {formMessage && (
            <div className={`rounded-xl border p-4 text-sm font-bold ${formMessage.startsWith("Đã gửi") || formMessage.startsWith("Đã cập nhật") ? "border-[var(--green-500)] bg-[var(--green-100)] text-[var(--green-700)]" : "border-[var(--gold-500)] bg-[var(--gold-100)] text-[var(--navy-900)]"}`}>
              <p>{formMessage}</p>
              {(formMessage.startsWith("Đã gửi") || formMessage.startsWith("Đã cập nhật")) && (
                <p className="mt-1 text-xs font-black text-[var(--navy-800)]">Hồ sơ đã được ghi nhận trong kho dữ liệu prototype.</p>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-[var(--line)] bg-white/95 px-5 py-5 backdrop-blur sm:flex-row sm:justify-end sm:px-7">
          <button
            className="rounded-md border border-[var(--line)] bg-white px-5 py-3 text-sm font-black text-[var(--navy-800)]"
            type="button"
            onClick={clearForm}
          >
            Hủy
          </button>
          <button
            className="rounded-md border border-[var(--line)] bg-white px-5 py-3 text-sm font-black text-[var(--navy-800)]"
            type="button"
            onClick={backToList}
          >
            Về danh sách
          </button>
          <button
            className="rounded-md bg-[var(--navy-900)] px-5 py-3 text-sm font-black text-white"
            type="button"
            onClick={showWordPreview}
          >
            Xem preview bản Word
          </button>
          <button
            className="rounded-md bg-[var(--blue-700)] px-5 py-3 text-sm font-black text-white"
            type="button"
            onClick={exportDocx}
          >
            Xuất File DOCX
          </button>
          <button
            className="rounded-md bg-[var(--green-600)] px-5 py-3 text-sm font-black text-white shadow-md shadow-[var(--green-600)]/20"
            type="submit"
          >
            {editingId ? "Cập nhật sáng kiến" : "Gửi Sáng Kiến"}
          </button>
        </div>
      </form>
    </section>
  );
}

function InitiativeTable({
  items,
  openDetails,
  likeInitiative,
}: {
  items: Initiative[];
  openDetails: (item: Initiative) => void;
  likeInitiative: (id: number) => void;
}) {
  return (
    <>
      <div className="hidden lg:block">
        <div className="grid grid-cols-[1.4fr_0.7fr_1fr_0.7fr_0.55fr] gap-3 bg-[var(--navy-900)] px-4 py-3 text-sm font-black text-white">
          <span>Tên sáng kiến</span>
          <span>Lĩnh vực</span>
          <span>Đơn vị</span>
          <span>Trạng thái</span>
          <span>Quan tâm</span>
        </div>
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[1.4fr_0.7fr_1fr_0.7fr_0.55fr] gap-3 border-t border-[var(--line)] px-4 py-4 text-sm">
            <button className="text-left font-black text-[var(--blue-700)]" onClick={() => openDetails(item)}>
              {item.ten}
              <span className="mt-1 block text-xs font-semibold text-[var(--muted)]">{item.tacGia} • {item.ngayNop}</span>
            </button>
            <Pill field={item.linhVuc}>{item.linhVuc}</Pill>
            <span className="font-semibold text-[var(--muted)]">{item.donVi}</span>
            <StatusBadge status={item.trangThai} />
            <button
              className="w-fit rounded-md bg-[var(--green-100)] px-3 py-2 font-black text-[var(--green-700)]"
              onClick={() => likeInitiative(item.id)}
              aria-label={`Quan tâm sáng kiến ${item.ten}`}
            >
              ♥ {item.quanTam}
            </button>
          </div>
        ))}
      </div>
      <div className="grid gap-3 p-4 lg:hidden">
        {items.map((item) => (
          <InitiativeCard key={item.id} item={item} canOpen onOpen={openDetails} likeInitiative={likeInitiative} />
        ))}
      </div>
    </>
  );
}

function InitiativeCard({
  item,
  canOpen,
  onOpen,
  likeInitiative,
  compact = false,
}: {
  item: Initiative;
  canOpen: boolean;
  onOpen: (item: Initiative) => void;
  likeInitiative?: (id: number) => void;
  compact?: boolean;
}) {
  const meta = fieldMeta[item.linhVuc];
  return (
    <article className="card group overflow-hidden rounded-xl transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className={`${compact ? "h-28" : "h-36"} relative overflow-hidden`}>
        <img src={meta.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3"><Pill field={item.linhVuc}>{item.linhVuc}</Pill></div>
        {!canOpen && (
          <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md bg-[var(--green-600)] text-white">
            <Lock className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <StatusBadge status={item.trangThai} />
          {item.giaiThuong !== "Chờ xét chọn" && <Pill tone="gold">{item.giaiThuong}</Pill>}
        </div>
        <button className="text-left" onClick={() => onOpen(item)} aria-label={`Xem chi tiết sáng kiến ${item.ten}`}>
          <h3 className="line-clamp-2 text-base font-black leading-6 text-[var(--navy-900)]">{item.ten}</h3>
        </button>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{item.tomTat}</p>
        <div className="mt-4 flex items-end justify-between gap-3 text-sm">
          <span className="min-w-0">
            <span className="block font-black text-[var(--blue-700)]">{item.tacGia}</span>
            <span className="block truncate text-xs font-semibold text-[var(--muted)]">{item.donVi}</span>
          </span>
          <button
            className="shrink-0 font-black text-[var(--green-600)]"
            onClick={() => (likeInitiative ? likeInitiative(item.id) : onOpen(item))}
            aria-label={likeInitiative ? `Quan tâm sáng kiến ${item.ten}` : `Xem chi tiết sáng kiến ${item.ten}`}
          >
            ♡ {item.quanTam}
          </button>
        </div>
      </div>
    </article>
  );
}

function DetailDrawer({
  item,
  canInteract,
  close,
  like,
  edit,
}: {
  item: Initiative;
  canInteract: boolean;
  close: () => void;
  like: () => void;
  edit: () => void;
}) {
  return (
    <div className="detail-backdrop fixed inset-0 z-50 bg-[var(--navy-950)]/65" role="dialog" aria-modal="true" aria-label={`Chi tiết sáng kiến ${item.ten}`}>
      <button className="absolute inset-0 h-full w-full cursor-default" onClick={close} aria-label="Đóng chi tiết sáng kiến" />
      <aside className="detail-drawer absolute bottom-0 right-0 flex max-h-[96vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:top-0 sm:h-full sm:max-h-none sm:w-[min(82vw,540px)] sm:rounded-l-2xl sm:rounded-tr-none">
        <img src={fieldMeta[item.linhVuc].image} alt="" className="h-48 w-full object-cover" />
        <div className="scrollbar-thin overflow-auto p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Pill field={item.linhVuc}>{item.linhVuc}</Pill>
                <StatusBadge status={item.trangThai} />
                {item.giaiThuong !== "Chờ xét chọn" && <Pill tone="gold">{item.giaiThuong}</Pill>}
              </div>
              <h3 className="text-balance text-2xl font-black leading-tight sm:text-3xl">{item.ten}</h3>
              <p className="mt-2 text-sm font-bold text-[var(--muted)]">
                {item.tacGia}{item.dongTacGia ? `, ${item.dongTacGia}` : ""} • {item.donVi}
              </p>
            </div>
            <button className="rounded-md border border-[var(--line)] px-3 py-2 text-sm font-black" onClick={close} aria-label="Đóng chi tiết sáng kiến">
              Đóng
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Metric label="Quan tâm" value={String(item.quanTam)} />
            <Metric label="Ngày nộp" value={item.ngayNop} />
          </div>
          <div className="mt-6 space-y-5 text-sm leading-7 text-[var(--navy-800)]">
            <ContentBlock title="Lý do đề xuất" text={item.lyDo} />
            <ContentBlock title="Mục tiêu" text={item.mucTieu} />
            <ContentBlock title="Thực trạng" text={item.thucTrang} />
            <ContentBlock title="Giải pháp mới" text={item.giaiPhap} />
            <ContentBlock title="Cách thức áp dụng" text={item.cachThuc} />
            <ContentBlock title="Nội dung tóm tắt" text={item.tomTat} />
            <ContentBlock title="Hiệu quả dự kiến" text={item.hieuQua} />
            <ContentBlock title="Tính mới" text={item.tinhMoi} />
            <ContentBlock title="Khả năng nhân rộng" text={item.nhanRong} />
          </div>
          {canInteract && (
            <div className="sticky bottom-0 -mx-5 mt-6 flex flex-col gap-3 border-t border-[var(--line)] bg-white/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:flex-row sm:px-7">
              <button className="rounded-md bg-[var(--green-600)] px-4 py-3 text-sm font-black text-white" onClick={like} aria-label={`Quan tâm sáng kiến ${item.ten}`}>
                Quan tâm sáng kiến này
              </button>
              {item.cuaToi && (
                <button className="rounded-md border border-[var(--line)] px-4 py-3 text-sm font-black" onClick={edit}>
                  Chỉnh sửa sáng kiến
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Chatbot({
  open,
  setOpen,
  messages,
  input,
  setInput,
  send,
  applySuggestion,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  send: (text: string) => void;
  applySuggestion: (suggestion: ChatSuggestion) => void;
}) {
  const prompts = [
    "Gợi ý cho tôi sáng kiến về tiết kiệm KHCN-ĐMST",
    "Ban Quản trị nguồn nhân lực thì nên làm sáng kiến gì?",
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:inset-auto sm:bottom-5 sm:right-5 sm:px-0 sm:pb-0">
      {open && (
        <section
          className="chat-panel card mb-3 flex h-[min(720px,calc(100vh-5rem))] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:h-[min(620px,calc(100vh-7rem))] sm:w-[430px] sm:rounded-xl"
          role="dialog"
          aria-label="Trợ lý AI Sáng kiến"
        >
          <header className="bg-[var(--navy-900)] px-4 py-3 text-white">
            <h3 className="font-black">Trợ lý AI Sáng kiến</h3>
            <p className="text-xs text-white/70">Gợi ý dựa trên dữ liệu sáng kiến đã cập nhật</p>
          </header>
          <div className="scrollbar-thin flex-1 space-y-3 overflow-auto p-4">
            <div className="flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button key={prompt} className="rounded-md bg-[var(--green-100)] px-3 py-2 text-left text-xs font-bold text-[var(--green-700)]" onClick={() => send(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
            {messages.map((message, index) => (
              <div key={index} className={`rounded-lg p-3 text-sm leading-6 ${message.from === "bot" ? "bg-[var(--mist)] text-[var(--navy-800)]" : "ml-8 bg-[var(--green-600)] text-white"}`}>
                <p>{message.text}</p>
                {message.suggestions && (
                  <div className="mt-3 grid gap-3">
                    {message.suggestions.map((suggestion) => (
                      <article key={suggestion.title} className="rounded-xl border border-[var(--line)] bg-white p-3">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Pill field={suggestion.field}>{suggestion.field}</Pill>
                          <Pill tone="gold">Gợi ý AI</Pill>
                        </div>
                        <h4 className="font-black text-[var(--navy-900)]">{suggestion.title}</h4>
                        <p className="mt-2 text-xs font-bold text-[var(--muted)]">Vấn đề: {suggestion.problem}</p>
                        <p className="mt-2 text-xs font-bold text-[var(--navy-800)]">Giải pháp: {suggestion.solution}</p>
                        <p className="mt-2 text-xs font-bold text-[var(--green-700)]">Hiệu quả: {suggestion.expectedImpact}</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          <button className="rounded-md bg-[var(--green-600)] px-3 py-2 text-xs font-black text-white sm:col-span-2" onClick={() => applySuggestion(suggestion)}>
                            Đưa vào form
                          </button>
                          <button className="rounded-md border border-[var(--line)] px-3 py-2 text-xs font-black text-[var(--navy-800)]" onClick={() => send(`Tìm sáng kiến tương tự với ${suggestion.title}`)}>
                            Tìm tương tự
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <form className="flex gap-2 border-t border-[var(--line)] p-3" onSubmit={(event) => { event.preventDefault(); send(input); }}>
            <input className="min-w-0 flex-1 rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--green-600)]" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Nhập câu hỏi..." />
            <button className="rounded-md bg-[var(--green-600)] px-3 py-2 text-sm font-black text-white">Gửi</button>
          </form>
        </section>
      )}
      <button
        className="ml-auto grid h-13 w-13 place-items-center rounded-full bg-[var(--green-600)] text-white shadow-xl shadow-green-900/25 ring-4 ring-white sm:h-14 sm:w-14"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
      >
        <Bot className="h-7 w-7" />
      </button>
    </div>
  );
}

function PageFrame({
  eyebrow,
  title,
  children,
  variant = "default",
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  variant?: "default" | "campaign";
}) {
  return (
    <section className={`app-container pb-8 pt-24 lg:pb-12 lg:pt-28 ${variant === "campaign" ? "relative" : ""}`}>
      <SectionTitle eyebrow={eyebrow} title={title} />
      {children}
    </section>
  );
}

function SectionTitle({
  eyebrow,
  title,
  icon: Icon = Sparkles,
  tone = "default",
}: {
  eyebrow?: string;
  title: string;
  icon?: LucideIcon;
  tone?: "default" | "campaign";
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      {eyebrow ? (
        <div>
          <p className="text-xs font-black uppercase text-[var(--green-600)]">{eyebrow}</p>
          <h2 className={`mt-1 text-2xl font-black leading-tight text-[var(--navy-900)] sm:text-3xl ${tone === "campaign" ? "campaign-subtitle" : ""}`}>{title}</h2>
        </div>
      ) : (
        <>
          <h2 className={`text-2xl font-black leading-tight text-[var(--navy-900)] ${tone === "campaign" ? "campaign-subtitle" : ""}`}>{title}</h2>
          <Icon className="h-5 w-5 text-[var(--green-600)]" />
        </>
      )}
    </div>
  );
}

function StatTile({ icon: Icon, value, label, caption, color, card = false }: { icon: LucideIcon; value: string; label: string; caption: string; color: string; card?: boolean }) {
  return (
    <div className={`${card ? "card rounded-xl" : "border-b border-[var(--line)] md:border-b-0 md:border-r"} p-5`}>
      <div className="flex items-center gap-4">
        <Icon className="h-8 w-8 shrink-0" style={{ color }} />
        <div>
          <p className="text-3xl font-black leading-none" style={{ color }}>{value}</p>
          <p className="mt-2 text-sm font-black leading-5">{label}</p>
          <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{caption}</p>
        </div>
      </div>
    </div>
  );
}

function ChartPanel({ title, children, action, className = "" }: { title: string; children: React.ReactNode; action?: () => void; className?: string }) {
  return (
    <section className={`card rounded-xl p-4 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-black">{title}</h3>
        {action && <button className="text-xs font-black text-[var(--blue-700)]" onClick={action}>Xem tất cả</button>}
      </div>
      {children}
    </section>
  );
}

function LeaderboardRow({ index, name, value, max, active = false, onClick }: { index: number; name: string; value: number; max: number; active?: boolean; onClick?: () => void }) {
  return (
    <button className={`w-full rounded-lg p-2 text-left ${active ? "bg-[var(--green-100)]" : "bg-white hover:bg-[var(--mist)]"}`} onClick={onClick}>
      <div className="flex items-center gap-3">
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black ${index <= 3 ? "bg-[var(--green-600)] text-white" : "bg-[var(--blue-100)] text-[var(--blue-700)]"}`}>{index}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-black">{name}</span>
        <span className="text-sm font-black">{value}</span>
      </div>
      <div className="ml-9 mt-2 h-2 rounded-full bg-[var(--mist)]">
        <div className="h-2 rounded-full bg-[var(--blue-700)]" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </button>
  );
}

function WordCloud({ selectedField, onSelect }: { selectedField?: string; onSelect?: (field: Field) => void }) {
  const words: { label: string; field: Field }[] = [
    { label: "Chuyển đổi số", field: "Công nghệ" },
    { label: "Tiết kiệm năng lượng", field: "Môi trường" },
    { label: "An toàn lao động", field: "An toàn" },
    { label: "Quy trình", field: "Quy trình" },
    { label: "Dữ liệu", field: "Công nghệ" },
    { label: "Sản xuất xanh", field: "Môi trường" },
    { label: "Tự động hóa", field: "Công nghệ" },
    { label: "Quản trị", field: "Quy trình" },
    { label: "Văn hóa số", field: "Khác" },
  ];
  return (
    <div className="grid min-h-48 place-items-center rounded-xl bg-[var(--mist)] p-4 text-center">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        {words.map((word, index) => (
          <button
            key={word.label}
            className={`${index < 2 ? "text-2xl sm:text-3xl" : index < 5 ? "text-sm" : "text-xs"} rounded-md px-1 font-black transition hover:scale-105 ${selectedField === word.field ? "bg-white shadow-sm" : ""}`}
            style={{ color: fieldMeta[word.field].color }}
            onClick={() => onSelect?.(word.field)}
            type="button"
          >
            {word.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DonutChart({
  total,
  fieldCounts,
  compact = false,
  selectedField,
  onFieldSelect,
}: {
  total: number;
  fieldCounts: readonly (readonly [Field, number])[];
  compact?: boolean;
  selectedField?: string;
  onFieldSelect?: (field: Field) => void;
}) {
  const colors = fieldCounts.map(([field]) => fieldMeta[field].color);
  const { segments } = fieldCounts.reduce(
    (acc, [, count], index) => {
      const start = acc.current;
      const size = total === 0 ? 0 : (count / total) * 100;
      const end = start + size;
      return {
        current: end,
        segments: [...acc.segments, `${colors[index]} ${start}% ${end}%`],
      };
    },
    { current: 0, segments: [] as string[] },
  );
  const gradientSegments = segments.join(", ");
  return (
    <div>
      <button
        className={`mx-auto grid ${compact ? "h-40 w-40" : "h-48 w-48"} place-items-center rounded-full transition hover:scale-[1.02]`}
        style={{ background: `conic-gradient(${gradientSegments || "var(--line) 0 100%"})` }}
        onClick={() => {
          const top = fieldCounts.slice().sort((a, b) => b[1] - a[1])[0]?.[0];
          if (top) onFieldSelect?.(top);
        }}
        type="button"
        aria-label="Lọc theo lĩnh vực có nhiều sáng kiến nhất"
      >
        <div className="grid h-[68%] w-[68%] place-items-center rounded-full bg-white text-center">
          <div>
            <p className="text-3xl font-black">{total}</p>
            <p className="text-xs font-bold text-[var(--muted)]">sáng kiến</p>
          </div>
        </div>
      </button>
      {onFieldSelect && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {fieldCounts.map(([field, count]) => (
            <button
              key={field}
              className={`rounded-full px-2.5 py-1 text-xs font-black ${selectedField === field ? "bg-[var(--navy-900)] text-white" : "bg-[var(--mist)] text-[var(--navy-900)]"}`}
              onClick={() => onFieldSelect(field)}
              type="button"
            >
              {field} · {count}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBar({
  selectedDepartment,
  selectedField,
  selectedStatus,
  searchQuery,
  setSelectedDepartment,
  setSelectedField,
  setSelectedStatus,
  setSearchQuery,
  filterSummary,
  clearFilters,
}: {
  selectedDepartment: string;
  selectedField: string;
  selectedStatus: string;
  searchQuery: string;
  setSelectedDepartment: (value: string) => void;
  setSelectedField: (value: string) => void;
  setSelectedStatus: (value: string) => void;
  setSearchQuery: (value: string) => void;
  filterSummary: { key: string; label: string; value: string }[];
  clearFilters: () => void;
}) {
  const controls = (
    <>
      <Select label="Phòng ban" value={selectedDepartment} onChange={setSelectedDepartment} options={["Tất cả", ...departments]} />
      <Select label="Lĩnh vực" value={selectedField} onChange={setSelectedField} options={["Tất cả", ...fields]} />
      <Select label="Trạng thái" value={selectedStatus} onChange={setSelectedStatus} options={statuses} />
      <label>
        <span className="flex items-center gap-2 text-xs font-black uppercase text-[var(--muted)]"><Filter className="h-3.5 w-3.5" /> Tìm kiếm</span>
        <input className="mt-2 w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm font-semibold outline-none focus:border-[var(--green-600)]" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tên, tác giả, nội dung..." />
      </label>
    </>
  );

  return (
    <>
      <div className="card sticky top-[76px] z-20 hidden gap-3 rounded-xl p-4 md:grid md:grid-cols-[1fr_1fr_1fr_1.2fr]">
        {controls}
        <div className="md:col-span-4">
          <ActiveFilterChips filters={filterSummary} clearFilters={clearFilters} compact />
        </div>
      </div>
      <details className="card sticky top-16 z-20 rounded-xl p-3 md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg bg-[var(--mist)] px-3 py-3 text-sm font-black text-[var(--navy-900)]">
          <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Bộ lọc</span>
          <span className="text-xs text-[var(--muted)]">{selectedField} / {selectedStatus}</span>
        </summary>
        <div className="mt-3 grid gap-3">
          {controls}
          <ActiveFilterChips filters={filterSummary} clearFilters={clearFilters} compact />
        </div>
      </details>
    </>
  );
}

function ActiveFilterChips({
  filters,
  clearFilters,
  compact = false,
}: {
  filters: { key: string; label: string; value: string }[];
  clearFilters: () => void;
  compact?: boolean;
}) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "mt-1" : "mb-4"}`}>
      {filters.map((filter) => (
        <span key={`${filter.key}-${filter.value}`} className="active-filter-chip">
          <span className="text-[var(--muted)]">{filter.label}</span>
          {filter.value}
        </span>
      ))}
      <button className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-black text-[var(--navy-800)]" onClick={clearFilters}>
        Xóa bộ lọc
      </button>
    </div>
  );
}

function AuthGatePanel({ title, description, action, onAction }: { title: string; description: string; action: string; onAction: () => void }) {
  return (
    <div className="card grid gap-4 rounded-xl p-6 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <Lock className="h-8 w-8 text-[var(--green-600)]" />
        <h3 className="mt-3 text-xl font-black">{title}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
      <button className="rounded-md bg-[var(--green-600)] px-5 py-3 text-sm font-black text-white" onClick={onAction}>{action}</button>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return (
    <label>
      <span className="text-xs font-black uppercase text-[var(--muted)]">{label}</span>
      <select className="mt-2 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-bold outline-none focus:border-[var(--green-600)]" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const append = (snippet: string) => {
    const spacer = value.trim().length > 0 && !value.endsWith("\n") ? "\n" : "";
    onChange(`${value}${spacer}${snippet}`);
  };

  return (
    <label className="mt-4 block">
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-black">{label}</span>
        <span className="flex shrink-0 gap-1 rounded-md border border-[var(--line)] bg-[var(--mist)] p-1">
          <button className="grid h-7 w-7 place-items-center rounded bg-white text-xs font-black text-[var(--navy-900)]" type="button" onClick={() => append("• ")}>
            •
          </button>
          <button className="grid h-7 w-7 place-items-center rounded bg-white text-xs font-black text-[var(--navy-900)]" type="button" onClick={() => append("1. ")}>
            1.
          </button>
          <button className="grid h-7 w-7 place-items-center rounded bg-white text-xs font-black text-[var(--navy-900)]" type="button" onClick={() => append("**nội dung nhấn mạnh**")}>
            B
          </button>
        </span>
      </span>
      <textarea
        className="mt-2 min-h-32 w-full resize-y rounded-md border border-[var(--line)] bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[var(--green-600)] focus:ring-4 focus:ring-[var(--green-100)]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function Pill({ children, field, tone }: { children: React.ReactNode; field?: Field; tone?: "gold" }) {
  const color = field ? fieldMeta[field].color : tone === "gold" ? "var(--gold-500)" : "var(--blue-700)";
  const bg = field ? fieldMeta[field].bg : tone === "gold" ? "var(--gold-100)" : "var(--blue-100)";
  return <span className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-black" style={{ color, backgroundColor: bg }}>{children}</span>;
}

function StatusBadge({ status }: { status: Status }) {
  return status === "Đã duyệt" ? <Pill>Đã duyệt</Pill> : <Pill tone="gold">Chờ duyệt</Pill>;
}

function Avatar({ name, index }: { name: string; index: number }) {
  const initials = name.split(" ").slice(-2).map((part) => part[0]).join("");
  return <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--blue-100)] text-xs font-black text-[var(--blue-700)]">{index + 1}{initials.slice(0, 1)}</div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--mist)] p-4">
      <p className="text-xs font-black uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[var(--navy-900)]">{value}</p>
    </div>
  );
}

function ContentBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h4 className="font-black text-[var(--blue-700)]">{title}</h4>
      <p className="mt-2">{text}</p>
    </div>
  );
}

function AdminInsight({ icon: Icon, title, text, phase2 = false }: { icon: LucideIcon; title: string; text: string; phase2?: boolean }) {
  return (
    <div className="card rounded-xl p-5">
      <Icon className="h-8 w-8 text-[var(--green-600)]" />
      <div className="mt-3 flex items-center gap-2">
        <h3 className="font-black">{title}</h3>
        {phase2 && <Pill tone="gold">Phase 2</Pill>}
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
    </div>
  );
}

function HonorFooter() {
  return (
    <footer className="mt-8 px-4 pb-12 pt-4 sm:px-6">
      <div className="campaign-panel mx-auto max-w-7xl rounded-2xl p-5 sm:p-7">
        <p className="text-xs font-black uppercase text-[var(--green-600)]">Người thắp lửa đổi mới</p>
        <h2 className="campaign-subtitle mt-2 text-3xl font-black leading-tight text-[var(--navy-900)]">Những câu chuyện tạo động lực thi đua.</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {innovators.map((person) => (
            <article key={person.ten} className="grid gap-4 rounded-xl border border-[var(--line)] bg-white p-4 shadow-sm sm:grid-cols-[92px_1fr] sm:items-center">
              <div className="honor-avatar" aria-hidden="true">
                <span>{person.ten.split(" ").slice(-2).map((part) => part[0]).join("")}</span>
              </div>
              <div>
                <p className="font-black text-[var(--navy-900)]">{person.ten}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{person.donVi} • {person.count} sáng kiến</p>
                <p className="mt-3 text-sm leading-6 text-[var(--navy-800)]">{person.quote}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </footer>
  );
}

function LoginPrompt({ close, login }: { close: () => void; login: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--navy-950)]/60 p-4" role="dialog" aria-modal="true" aria-labelledby="login-prompt-title">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <Lock className="h-9 w-9 text-[var(--green-600)]" />
        <h3 id="login-prompt-title" className="mt-4 text-2xl font-black">Cần đăng nhập tài khoản Tập đoàn</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Tạo sáng kiến, hỏi AI, xem chi tiết và bấm quan tâm là các chức năng dành cho người dùng đã đăng nhập.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button className="rounded-md border border-[var(--line)] px-4 py-3 text-sm font-black" onClick={close}>Để sau</button>
          <button className="rounded-md bg-[var(--green-600)] px-4 py-3 text-sm font-black text-white" onClick={login}>Đăng nhập tài khoản Tập đoàn</button>
        </div>
      </div>
    </div>
  );
}

function WordPreview({ form, close, exportDocx }: { form: FormState; close: () => void; exportDocx: () => void }) {
  const authors = form.danhSachTacGia
    .map((author) => author.hoTen.trim())
    .filter(Boolean)
    .join("; ");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--navy-950)]/65 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-4">
          <h3 className="text-xl font-black">Preview bản Word</h3>
          <button className="rounded-md border border-[var(--line)] px-3 py-2 text-sm font-black" onClick={close}>Đóng</button>
        </div>
        <div className="m-5 rounded-lg border border-[var(--line)] bg-white p-6 shadow-inner">
          <p className="text-center text-sm font-black uppercase">Cổng thông tin sáng kiến Công đoàn Công ty Mẹ</p>
          <h4 className="mt-6 text-xl font-black">{form.ten || "Tên sáng kiến chưa nhập"}</h4>
          <p className="mt-2 text-sm text-[var(--muted)]">Lĩnh vực: {form.linhVuc} • Đơn vị: {form.donVi}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Tác giả: {authors || "Chưa nhập"}</p>
          <ContentBlock title="Lý do đề xuất" text={form.lyDo || "Chưa nhập"} />
          <div className="mt-5"><ContentBlock title="Giải pháp mới" text={form.giaiPhap || "Chưa nhập"} /></div>
          <div className="mt-5"><ContentBlock title="Hiệu quả dự kiến" text={form.hieuQua || "Chưa nhập"} /></div>
        </div>
        <div className="flex justify-end border-t border-[var(--line)] p-4">
          <button className="rounded-md bg-[var(--navy-900)] px-4 py-3 text-sm font-black text-white" onClick={exportDocx}>
            Tải file DOCX
          </button>
        </div>
      </div>
    </div>
  );
}
