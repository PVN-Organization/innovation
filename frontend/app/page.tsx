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

export default function Home() {
  const {
    initiatives,
    optimisticLike,
    refresh: refreshInitiatives,
    addLocal,
    updateLocal,
  } = useInitiatives();

  const role: Role = authUser?.is_admin ? "admin" : "guest";
  const isLoggedIn = !!authUser;
  const [view, setView] = useState<View>("landing");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("Tất cả");
  const [selectedField, setSelectedField] = useState("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [adminDepartment, setAdminDepartment] = useState("Tất cả");
  const [adminField, setAdminField] = useState("Tất cả");
  const [adminStatus, setAdminStatus] = useState("Tất cả");
  const [range, setRange] = useState("Tháng này");
  const [initiativeMode, setInitiativeMode] = useState<"list" | "form">("list");
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showWordPreview, setShowWordPreview] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
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
    exportDocx,
    startEdit,
  } = useInitiativeForm({
    initiatives,
    addLocal,
    updateLocal,
    refreshInitiatives: refresh,
    onCancel: () => {
      setView("initiatives");
      setInitiativeMode("list");
    },
  });

  const isAuthed = role !== "guest";
  const isAdmin = role === "admin";

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

  const adminItems = useMemo(
    () =>
      initiatives.filter(
        (item) =>
          (adminDepartment === "Tất cả" || item.donVi === adminDepartment) &&
          (adminField === "Tất cả" || item.linhVuc === adminField) &&
          (adminStatus === "Tất cả" || item.trangThai === adminStatus),
      ),
    [adminDepartment, adminField, adminStatus, initiatives],
  );

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

  function loginAdmin() {
    setRole("admin");
    setView("admin");
    setChatOpen(false);
  }

  function logout() {
    setRole("guest");
    setView("landing");
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

  function sendChat(text: string) {
    const message = text.trim();
    if (!message) return;
    setChatMessages((items) => [
      ...items,
      { from: "user", text: message },
      { from: "bot", text: aiAnswer(message) },
    ]);
    setChatInput("");
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#172033]">
      <Navigation role={role} view={view} loginAdmin={loginAdmin} logout={logout} go={go} />

      {view === "landing" && (
        <LandingPage
          isAuthed={isAuthed}
          initiatives={initiatives}
          filtered={publicFiltered}
          departmentCounts={departmentCounts}
          fieldCounts={fieldCounts}
          leaderBoard={leaderBoard}
          totals={totals}
          selectedDepartment={selectedDepartment}
          selectedField={selectedField}
          setSelectedDepartment={setSelectedDepartment}
          setSelectedField={setSelectedField}
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
          otpSentTo={otpSentTo}
          editingId={editingId}
          selectedDepartment={selectedDepartment}
          selectedField={selectedField}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
          setSelectedDepartment={setSelectedDepartment}
          setSelectedField={setSelectedField}
          setPage={setPage}
          openDetails={openDetails}
          likeInitiative={likeInitiative}
        />
      )}

      {view === "form" && (
        <InitiativeForm
          form={form}
          otpSentTo={otpSentTo}
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
          login={() => setRole("employee")}
        />
      )}

      {view === "stats" && (
        <StatsPage
          isAuthed={isAuthed}
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
          openDetails={openDetails}
          likeInitiative={likeInitiative}
          login={() => setRole("employee")}
        />
      )}

      {view === "competition" && (
        <CompetitionPage
          isAuthed={isAuthed}
          range={range}
          setRange={setRange}
          initiatives={initiatives}
          departmentCounts={departmentCounts}
          leaderBoard={leaderBoard}
          openDetails={openDetails}
          login={() => setRole("employee")}
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
          login={() => setRole("employee")}
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
          exportCsv={exportCsv}
        />
      )}

      {selectedInitiative && (
        <DetailModal
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
          login={() => {
            setRole("employee");
            setShowLoginPrompt(false);
          }}
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
        />
      )}
    </main>
  );
}

function Navigation({
  role,
  view,
  loginAdmin,
  logout,
  go,
}: {
  view: View;
  loginAdmin: () => void;
  logout: () => void;
  go: (view: View) => void;
}) {
  const isAdmin = role === "admin";
  const navItems: { id: View; label: string; visible: boolean }[] = [
    { id: "landing", label: "Trang chủ", visible: true },
    { id: "form", label: "Đăng ký sáng kiến", visible: true },
    { id: "admin", label: "Quản trị", visible: isAdmin },
  ];

  return (
    <header className="top-nav sticky top-0 z-40">
      <div className="app-container flex h-16 items-center justify-between gap-4 lg:h-[76px]">
        <button className="focus-ring flex min-w-0 items-center gap-3 text-left lg:w-[270px]" onClick={() => go("landing")}>
          <img src="/logo-pvn.png" alt="Petrovietnam" className="h-10 w-auto object-contain" />
          <span className="leading-tight">
            <span className="block text-[11px] font-black uppercase text-[var(--green-600)] sm:text-xs">
              Công đoàn Công ty Mẹ
            </span>
            <span className="block text-sm font-black uppercase text-[var(--green-600)] sm:text-base">
              Cổng thông tin sáng kiến
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems
            .filter((item) => item.visible)
            .map((item) => (
              <button
                key={item.id}
                className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                  view === item.id
                    ? "bg-[#2E3D8F] text-white shadow-md shadow-[#2E3D8F]/15"
                    : "bg-white/70 text-[#485466] hover:bg-white"
                }`}
                onClick={() => go(item.id)}
              >
                {item.label}
              </button>
            ))}
          {!isAdmin ? (
            <button
              className="rounded-md bg-[#32B34A] px-4 py-2 text-sm font-black text-white shadow-md shadow-[#32B34A]/20"
              onClick={loginAdmin}
              title="Đăng nhập quản trị bằng Azure AD"
            >
              Đăng nhập tài khoản Tập đoàn
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-white px-3 py-2 text-sm font-bold text-[#485466]">
                Quản trị viên
              </span>
              <button
                className="rounded-md border border-[#2E3D8F]/15 bg-white px-3 py-2 text-sm font-black text-[#2E3D8F]"
                onClick={logout}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function LandingPage({
  isAuthed,
  initiatives,
  filtered,
  departmentCounts,
  fieldCounts,
  leaderBoard,
  totals,
  selectedDepartment,
  selectedField,
  setSelectedDepartment,
  setSelectedField,
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
  leaderBoard: { ten: string; donVi: string; soSangKien: number }[];
  totals: { approved: number; pending: number; interests: number; topField: Field };
  selectedDepartment: string;
  selectedField: string;
  setSelectedDepartment: (value: string) => void;
  setSelectedField: (value: string) => void;
  startCreate: () => void;
  openDetails: (item: Initiative) => void;
  openChat: () => void;
  showLogin: () => void;
  go: (view: View) => void;
}) {
  return (
    <section className="relative min-h-[560px] overflow-hidden bg-[#2E3D8F] text-white">
      <img
        src="/hero-innovation.png"
        alt="Minh họa đội ngũ Petrovietnam trao đổi sáng kiến trên dashboard số"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(46,61,143,0.97)_0%,rgba(46,61,143,0.82)_48%,rgba(46,61,143,0.32)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,#F5F7FA)]" />
      <div className="soft-grid absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:pb-28 lg:pt-28">
        <div className="flex max-w-4xl flex-col justify-center">
          <h2 className="max-w-3xl text-5xl font-black leading-[0.96] sm:text-7xl">
            Sáng kiến tạo giá trị mới.
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/80 sm:text-lg">
            Nơi ghi nhận, lan tỏa và phát triển các giải pháp giúp Petrovietnam
            nâng cao hiệu quả vận hành, bảo đảm an toàn, tối ưu chi phí, thúc
            đẩy chuyển đổi số và đóng góp thiết thực cho mục tiêu sản xuất kinh
            doanh bền vững.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="rounded-md bg-[#32B34A] px-5 py-3 text-sm font-black text-white shadow-xl shadow-black/20"
              onClick={() => go("form")}
            >
              Gửi sáng kiến mới
            </button>
            <button
              className="rounded-md border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur"
              onClick={() => go("dashboard")}
            >
              Xem bảng xếp hạng
            </button>
          </div>
        </div>
      </section>

      <section className="app-container relative z-10 mt-4 lg:-mt-4">
        <div className="card grid overflow-hidden rounded-xl md:grid-cols-[repeat(4,1fr)_1.3fr]">
          <StatTile icon={Lightbulb} value={String(initiatives.length)} label="sáng kiến mới cập nhật" caption="Tuần này" color="var(--green-600)" />
          <StatTile icon={Users} value={String(fields.length)} label="lĩnh vực đổi mới trọng tâm" caption="Đang theo dõi" color="var(--blue-700)" />
          <StatTile icon={Heart} value={String(totals.interests)} label="lượt quan tâm" caption="Tháng này" color="var(--green-500)" />
          <StatTile icon={Trophy} value={String(departmentCounts.length)} label="Ban/Văn phòng tham gia thi đua" caption="Toàn Công ty Mẹ" color="var(--gold-500)" />
          <div className="border-t border-[var(--line)] p-5 md:border-l md:border-t-0">
            <p className="font-black">Đăng nhập để trải nghiệm đầy đủ</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Đăng nhập để tạo sáng kiến, xem chi tiết, kết nối và thi đua cùng đồng nghiệp.</p>
            {!isAuthed && (
              <button className="mt-4 rounded-md bg-[var(--green-600)] px-4 py-2 text-sm font-black text-white" onClick={showLogin}>
                Đăng nhập tài khoản Tập đoàn
              </button>
            )}
          </div>
        </div>
      </section>

      <BasicStats
        filtered={filtered}
        departmentCounts={departmentCounts}
        fieldCounts={fieldCounts}
        leaderBoard={leaderBoard}
        selectedDepartment={selectedDepartment}
        selectedField={selectedField}
        setSelectedDepartment={setSelectedDepartment}
        setSelectedField={setSelectedField}
        showLogin={showLogin}
        go={go}
      />

      <section className="app-container pb-8">
        <SectionTitle title="Sáng kiến được quan tâm" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {filtered
            .slice()
            .sort((a, b) => b.quanTam - a.quanTam)
            .slice(0, 5)
            .map((item) => (
              <InitiativeCard key={item.id} item={item} canOpen={isAuthed} onOpen={openDetails} compact />
            ))}
        </div>
      </section>

      <HonorFooter />
    </>
  );
}

function BasicStats({
  filtered,
  departmentCounts,
  fieldCounts,
  leaderBoard,
  selectedDepartment,
  selectedField,
  setSelectedDepartment,
  setSelectedField,
  showLogin,
  go,
}: {
  filtered: Initiative[];
  departmentCounts: [string, number][];
  fieldCounts: readonly (readonly [Field, number])[];
  leaderBoard: { ten: string; donVi: string; soSangKien: number }[];
  selectedDepartment: string;
  selectedField: string;
  setSelectedDepartment: (value: string) => void;
  setSelectedField: (value: string) => void;
  showLogin: () => void;
  go: (view: View) => void;
}) {
  const maxDepartment = Math.max(...departmentCounts.map(([, count]) => count), 1);
  const maxField = Math.max(...fieldCounts.map(([, count]) => count), 1);

  return (
    <section className="app-container py-10 lg:py-14">
      <SectionTitle title="Trang thống kê cơ bản" icon={Sparkles} />
      <div className="grid gap-4 lg:grid-cols-12">
        <ChartPanel className="lg:col-span-3" title="Top Ban/Văn phòng" action={() => go("competition")}>
          <div className="space-y-3">
            {departmentCounts.slice(0, 8).map(([name, count], index) => (
              <LeaderboardRow
                key={name}
                index={index + 1}
                name={name}
                value={count}
                active={selectedDepartment === name}
                max={maxDepartment}
                onClick={() => setSelectedDepartment(name)}
              />
            ))}
          </div>
        </ChartPanel>

        <ChartPanel className="lg:col-span-3" title="Top cá nhân" action={() => go("competition")}>
          <div className="space-y-3">
            {leaderBoard.map((person, index) => (
              <div key={person.ten} className="flex items-center gap-3 rounded-lg bg-[var(--mist)] p-3">
                <Avatar name={person.ten} index={index} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">{person.ten}</p>
                  <p className="truncate text-xs font-semibold text-[var(--muted)]">{person.donVi}</p>
                </div>
                <span className="text-sm font-black text-[var(--navy-900)]">{person.soSangKien}</span>
              </div>
            ))}
          </div>
        </ChartPanel>

        <ChartPanel className="lg:col-span-3" title="Lĩnh vực" action={() => showLogin()}>
          <WordCloud />
          <div className="mt-5 flex flex-wrap gap-2">
            {fields.map((field) => (
              <button
                key={field}
                className={`rounded-full px-3 py-1.5 text-xs font-black ${
                  selectedField === field ? "bg-[var(--green-600)] text-white" : "bg-[var(--mist)] text-[var(--navy-900)]"
                }`}
                onClick={() => setSelectedField(field)}
              >
                {field}
              </button>
            ))}
          </div>
        </ChartPanel>

        <ChartPanel className="lg:col-span-3" title="Tỷ lệ sáng kiến theo lĩnh vực" action={() => go("stats")}>
          <DonutChart total={filtered.length} fieldCounts={fieldCounts} />
          <div className="mt-5 space-y-2">
            {fieldCounts.map(([field, count]) => (
              <button key={field} className="w-full text-left" onClick={() => setSelectedField(field)}>
                <div className="mb-1 flex justify-between text-xs font-black">
                  <span>{field}</span>
                  <span>{count}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--mist)]">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${count === 0 ? 3 : (count / maxField) * 100}%`, backgroundColor: fieldMeta[field].color }}
                  />
                </div>
              </button>
            ))}
          </div>
        </ChartPanel>
      </div>
    </section>
  );
}

function InitiativesPage({
  isAuthed,
  mode,
  setMode,
  items,
  form,
  formMessage,
  otpSentTo,
  editingId,
  selectedDepartment,
  selectedField,
  selectedStatus,
  searchQuery,
  setSelectedDepartment,
  setSelectedField,
  setSelectedStatus,
  setSearchQuery,
  updateForm,
  sendOtp,
  submitInitiative,
  exportDocx,
  clearForm,
  openDetails,
  likeInitiative,
  editInitiative,
  showWordPreview,
  login,
}: {
  isAuthed: boolean;
  mode: "list" | "form";
  setMode: (mode: "list" | "form") => void;
  items: Initiative[];
  form: FormState;
  formMessage: string;
  otpSentTo: string;
  editingId: number | null;
  selectedDepartment: string;
  selectedField: string;
  selectedStatus: string;
  searchQuery: string;
  setSelectedDepartment: (value: string) => void;
  setSelectedField: (value: string) => void;
  setSelectedStatus: (value: string) => void;
  setSearchQuery: (value: string) => void;
  updateForm: (key: keyof FormState, value: string) => void;
  sendOtp: () => void;
  submitInitiative: (event: FormEvent<HTMLFormElement>) => void;
  exportDocx: () => void;
  clearForm: () => void;
  openDetails: (item: Initiative) => void;
  likeInitiative: (id: number) => void;
  editInitiative: (item: Initiative) => void;
  showWordPreview: () => void;
  login: () => void;
}) {
  if (!isAuthed) {
    return (
      <PageFrame eyebrow="Sáng kiến" title="Đăng nhập để gửi và xem chi tiết sáng kiến">
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
      <PageFrame eyebrow="Trình tạo Sáng kiến" title={editingId ? "Chỉnh sửa sáng kiến" : "Biểu mẫu đăng ký sáng kiến"}>
        <InitiativeForm
          form={form}
          formMessage={formMessage}
          otpSentTo={otpSentTo}
          editingId={editingId}
          updateForm={updateForm}
          sendOtp={sendOtp}
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
    <PageFrame eyebrow="Sáng kiến" title="Danh sách và sáng kiến của tôi">
      <FilterBar
        selectedDepartment={selectedDepartment}
        selectedField={selectedField}
        selectedStatus={selectedStatus}
        searchQuery={searchQuery}
        setSelectedDepartment={setSelectedDepartment}
        setSelectedField={setSelectedField}
        setSelectedStatus={setSelectedStatus}
        setSearchQuery={setSearchQuery}
      />
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="card overflow-hidden rounded-xl">
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
          <div className="card rounded-xl p-5">
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
          <div className="card rounded-xl bg-[var(--green-100)] p-5">
            <Bot className="h-8 w-8 text-[var(--green-600)]" />
            <h3 className="mt-3 font-black">Bí ý tưởng?</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--navy-800)]">Mở Trợ lý AI ở góc màn hình để nhận gợi ý theo dữ liệu sáng kiến mẫu.</p>
          </div>
        </aside>
      </div>
    </PageFrame>
  );
}

function StatsPage({
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
  openDetails,
  likeInitiative,
  login,
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
  openDetails: (item: Initiative) => void;
  likeInitiative: (id: number) => void;
  login: () => void;
}) {
  if (!isAuthed) {
    return (
      <PageFrame eyebrow="Thống kê" title="Dashboard chi tiết chỉ dành cho người đăng nhập">
        <AuthGatePanel
          title="Trang chủ đã có thống kê cơ bản"
          description="Đăng nhập để xem dashboard chi tiết, bảng sáng kiến và dữ liệu quan tâm theo bộ lọc."
          action="Đăng nhập để xem dashboard"
          onAction={login}
        />
      </PageFrame>
    );
  }

  return (
    <PageFrame eyebrow="Thống kê" title="Dashboard chi tiết sáng kiến">
      <FilterBar
        selectedDepartment={selectedDepartment}
        selectedField={selectedField}
        selectedStatus={selectedStatus}
        searchQuery={searchQuery}
        setSelectedDepartment={setSelectedDepartment}
        setSelectedField={setSelectedField}
        setSelectedStatus={setSelectedStatus}
        setSearchQuery={setSearchQuery}
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
              <LeaderboardRow key={name} index={index + 1} name={name} value={count} max={Math.max(...departmentCounts.map(([, c]) => c), 1)} onClick={() => setSelectedDepartment(name)} />
            ))}
          </div>
        </ChartPanel>
        <ChartPanel className="lg:col-span-4" title="Lĩnh vực / wordcloud">
          <WordCloud />
          <DonutChart total={items.length} fieldCounts={fieldCounts} compact />
        </ChartPanel>
        <ChartPanel className="lg:col-span-4" title="Mối quan tâm theo tác giả">
          <div className="space-y-3">
            {leaderBoard.map((person, index) => (
              <LeaderboardRow key={person.ten} index={index + 1} name={person.ten} value={person.soSangKien} max={Math.max(...leaderBoard.map((p) => p.soSangKien), 1)} />
            ))}
          </div>
        </ChartPanel>
      </div>
      <div className="mt-5 card overflow-hidden rounded-xl">
        <InitiativeTable items={items} openDetails={openDetails} likeInitiative={likeInitiative} />
      </div>
    </PageFrame>
  );
}

function CompetitionPage({
  isAuthed,
  range,
  setRange,
  initiatives,
  departmentCounts,
  leaderBoard,
  openDetails,
  login,
}: {
  isAuthed: boolean;
  range: string;
  setRange: (value: string) => void;
  initiatives: Initiative[];
  departmentCounts: [string, number][];
  leaderBoard: { ten: string; donVi: string; soSangKien: number }[];
  openDetails: (item: Initiative) => void;
  login: () => void;
}) {
  const topInitiatives = initiatives.slice().sort((a, b) => b.quanTam - a.quanTam).slice(0, 6);
  const awards = initiatives.filter((item) => item.giaiThuong !== "Chờ xét chọn").slice(0, 4);

  return (
    <PageFrame eyebrow="Thi đua" title="Bảng thi đua sáng kiến">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">Theo dõi các Ban/Văn phòng, cá nhân và sáng kiến được hưởng ứng nhiều nhất.</p>
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
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartPanel title="Top Ban/Văn phòng">
          {departmentCounts.slice(0, 6).map(([name, count], index) => (
            <LeaderboardRow key={name} index={index + 1} name={name} value={count} max={Math.max(...departmentCounts.map(([, c]) => c), 1)} />
          ))}
        </ChartPanel>
        <ChartPanel title="Top cá nhân">
          <div className="space-y-3">
            {leaderBoard.map((person, index) => (
              <div key={person.ten} className="flex items-center gap-3 rounded-lg bg-[var(--mist)] p-3">
                <Avatar name={person.ten} index={index} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">{person.ten}</p>
                  <p className="truncate text-xs font-semibold text-[var(--muted)]">{person.donVi}</p>
                </div>
                <span className="font-black">{person.soSangKien}</span>
              </div>
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
    <PageFrame eyebrow="Hướng dẫn" title="Tham gia phong trào sáng kiến trong 3 bước">
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="card rounded-xl p-5">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--green-100)] text-lg font-black text-[var(--green-700)]">{index + 1}</div>
            <h3 className="mt-4 text-lg font-black">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="card rounded-xl p-5">
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
        <div className="card rounded-xl bg-[var(--blue-100)] p-5">
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
  exportCsv,
}: {
  items: Initiative[];
  department: string;
  field: string;
  status: string;
  setDepartment: (value: string) => void;
  setField: (value: string) => void;
  setStatus: (value: string) => void;
  exportCsv: () => void;
}) {
  return (
    <PageFrame eyebrow="Admin Portal" title="Kho dữ liệu Sáng kiến">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="card overflow-hidden rounded-xl">
          <div className="grid gap-3 border-b border-[var(--line)] p-4 md:grid-cols-4">
            <Select label="Phòng ban" value={department} onChange={setDepartment} options={["Tất cả", ...departments]} />
            <Select label="Lĩnh vực" value={field} onChange={setField} options={["Tất cả", ...fields]} />
            <Select label="Trạng thái" value={status} onChange={setStatus} options={statuses} />
            <button className="rounded-md bg-[var(--green-600)] px-4 py-3 text-sm font-black text-white" onClick={exportCsv}>
              Export Excel/CSV
            </button>
          </div>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-[var(--navy-900)] text-white">
                <tr>
                  {["Tên sáng kiến", "Lĩnh vực", "Đơn vị", "Tác giả", "Trạng thái", "Quan tâm", "Điểm", "Giải thưởng"].map((head) => (
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
  otpSentTo,
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
  otpSentTo: string;
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
  const [coAuthorDraft, setCoAuthorDraft] = useState("");
  const coAuthors = form.dongTacGia
    .split(";")
    .map((name) => name.trim())
    .filter(Boolean);
  const otpReady = Boolean(otpSentTo && otpSentTo === form.email.trim());

  function addCoAuthor() {
    const nextName = coAuthorDraft.trim();
    if (!nextName) return;
    const nextAuthors = [...coAuthors, nextName];
    updateForm("dongTacGia", nextAuthors.join("; "));
    setCoAuthorDraft("");
  }

  function removeCoAuthor(index: number) {
    const nextAuthors = coAuthors.filter((_, currentIndex) => currentIndex !== index);
    updateForm("dongTacGia", nextAuthors.join("; "));
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-4xl font-black leading-tight text-[#2E3D8F]">
            {editingId ? "Chỉnh sửa sáng kiến" : "Biểu mẫu đăng ký sáng kiến"}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md border border-[#2E3D8F]/15 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#2E3D8F]">
            Chờ duyệt
          </span>
        </div>
      </div>

      <form className="premium-card overflow-hidden rounded-lg bg-white" onSubmit={submitInitiative}>
        <div className="border-b border-[#2E3D8F]/10 bg-white px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-black text-[#2E3D8F]">Thông tin sáng kiến</h3>
            <span className="text-sm font-bold text-[#667085]">Mã OTP mẫu: {DEMO_OTP}</span>
          </div>
        </div>

        <div className="grid gap-x-5 gap-y-5 px-5 py-6 sm:px-7 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-black text-[#263451]">Tên sáng kiến</span>
            <input
              className="mt-2 w-full rounded-md border border-[#2E3D8F]/16 bg-white px-4 py-3 text-base outline-none transition focus:border-[#32B34A] focus:ring-4 focus:ring-[#32B34A]/10"
              value={form.ten}
              onChange={(event) => updateForm("ten", event.target.value)}
              placeholder="Ví dụ: Tối ưu tiêu thụ năng lượng tại văn phòng"
            />
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#263451]">Lĩnh vực</span>
            <select
              className="mt-2 w-full rounded-md border border-[#2E3D8F]/16 bg-white px-4 py-3 text-base font-bold text-[#243047] outline-none transition focus:border-[#32B34A] focus:ring-4 focus:ring-[#32B34A]/10"
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
            <span className="text-sm font-black text-[#263451]">Đơn vị/Phòng ban</span>
            <select
              className="mt-2 w-full rounded-md border border-[#2E3D8F]/16 bg-white px-4 py-3 text-base font-bold text-[#243047] outline-none transition focus:border-[#32B34A] focus:ring-4 focus:ring-[#32B34A]/10"
              value={form.donVi}
              onChange={(event) => updateForm("donVi", event.target.value)}
            >
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#263451]">Tác giả chính</span>
            <input
              className="mt-2 w-full rounded-md border border-[#2E3D8F]/16 bg-white px-4 py-3 text-base outline-none transition focus:border-[#32B34A] focus:ring-4 focus:ring-[#32B34A]/10"
              value={form.tacGia}
              onChange={(event) => updateForm("tacGia", event.target.value)}
              placeholder="Nhập họ và tên tác giả chính"
            />
          </label>

          <div className="block">
            <span className="text-sm font-black text-[#263451]">Đồng tác giả</span>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                className="min-w-0 flex-1 rounded-md border border-[#2E3D8F]/16 bg-white px-4 py-3 text-base outline-none transition focus:border-[#32B34A] focus:ring-4 focus:ring-[#32B34A]/10"
                value={coAuthorDraft}
                onChange={(event) => setCoAuthorDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCoAuthor();
                  }
                }}
                placeholder="Nhập tên rồi bấm Thêm"
              />
              <button
                className="shrink-0 rounded-md bg-[#2E3D8F] px-4 py-3 text-sm font-black text-white"
                type="button"
                onClick={addCoAuthor}
              >
                Thêm
              </button>
            </div>
            {coAuthors.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {coAuthors.map((name, index) => (
                  <span
                    key={`${name}-${index}`}
                    className="inline-flex max-w-full items-center gap-2 rounded-md border border-[#2E3D8F]/15 bg-[#EEF1FF] px-3 py-2 text-sm font-bold text-[#2E3D8F]"
                  >
                    <span className="truncate">{name}</span>
                    <button
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-[#2E3D8F]"
                      type="button"
                      aria-label={`Xóa đồng tác giả ${name}`}
                      onClick={() => removeCoAuthor(index)}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-y border-[#2E3D8F]/10 bg-[#F8FAFC] px-5 py-6 sm:px-7">
          <h3 className="text-xl font-black text-[#2E3D8F]">Xác thực Email</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <label className="block">
              <span className="text-sm font-black text-[#263451]">Email xác thực</span>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  className="min-w-0 flex-1 rounded-md border border-[#2E3D8F]/16 bg-white px-4 py-3 text-base outline-none transition focus:border-[#32B34A] focus:ring-4 focus:ring-[#32B34A]/10"
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  placeholder="name@pvn.vn"
                  type="email"
                />
                <button
                  className="shrink-0 rounded-md bg-[#32B34A] px-4 py-3 text-sm font-black text-white shadow-md shadow-[#32B34A]/20 disabled:opacity-45"
                  type="button"
                  onClick={sendOtp}
                  disabled={!form.email.trim()}
                >
                  Gửi OTP
                </button>
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#263451]">Mã OTP Email</span>
              <input
                className="mt-2 w-full rounded-md border border-[#2E3D8F]/16 bg-white px-4 py-3 text-base outline-none transition focus:border-[#32B34A] focus:ring-4 focus:ring-[#32B34A]/10"
                value={form.otp}
                onChange={(event) => updateForm("otp", event.target.value)}
                placeholder="Nhập mã OTP trong email"
                inputMode="numeric"
              />
            </label>
          </div>
          {otpReady && !editingId && (
            <p className="mt-4 rounded-md border border-[#32B34A]/25 bg-[#F0FBF2] p-3 text-sm font-bold text-[#237D34]">
              OTP mô phỏng đã gửi tới {otpSentTo}. Mã dùng thử: {DEMO_OTP}
            </p>
          )}
        </div>

        <div className="grid gap-5 px-5 py-6 sm:px-7">
          <TextArea
            label="Nội dung tóm tắt"
            value={form.tomTat}
            onChange={(value) => updateForm("tomTat", value)}
            placeholder="Mô tả vấn đề, giải pháp đề xuất và phạm vi áp dụng..."
          />
          <TextArea
            label="Hiệu quả dự kiến"
            value={form.hieuQua}
            onChange={(value) => updateForm("hieuQua", value)}
            placeholder="Nêu hiệu quả về chi phí, thời gian, an toàn, môi trường hoặc chất lượng phục vụ đoàn viên..."
          />
          {message && (
            <p className="rounded-md border border-[#2E3D8F]/12 bg-[#EEF1FF] p-3 text-sm font-bold text-[#2E3D8F]">
              {message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#2E3D8F]/10 bg-white px-5 py-5 sm:flex-row sm:justify-end sm:px-7">
          <button
            className="rounded-md border border-[#2E3D8F]/15 bg-white px-5 py-3 text-sm font-black text-[#2E3D8F]"
            type="button"
            onClick={clearForm}
          >
            Hủy
          </button>
          <button
            className="rounded-md bg-[#2E3D8F] px-5 py-3 text-sm font-black text-white"
            type="button"
            onClick={exportDocx}
          >
            Xuất File DOCX
          </button>
          <button
            className="rounded-md bg-[#32B34A] px-5 py-3 text-sm font-black text-white shadow-md shadow-[#32B34A]/20"
            type="submit"
          >
            {otpReady && !editingId ? "Xác thực OTP và gửi" : "Gửi Sáng Kiến"}
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
            <button className="w-fit rounded-md bg-[var(--green-100)] px-3 py-2 font-black text-[var(--green-700)]" onClick={() => likeInitiative(item.id)}>
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
        <button className="text-left" onClick={() => onOpen(item)}>
          <h3 className="line-clamp-2 text-base font-black leading-6 text-[var(--navy-900)]">{item.ten}</h3>
        </button>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{item.tomTat}</p>
        <div className="mt-4 flex items-end justify-between gap-3 text-sm">
          <span className="min-w-0">
            <span className="block font-black text-[var(--blue-700)]">{item.tacGia}</span>
            <span className="block truncate text-xs font-semibold text-[var(--muted)]">{item.donVi}</span>
          </span>
          <button className="shrink-0 font-black text-[var(--green-600)]" onClick={() => (likeInitiative ? likeInitiative(item.id) : onOpen(item))}>
            ♡ {item.quanTam}
          </button>
        </div>
      </div>
    </article>
  );
}

function DetailModal({
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--navy-950)]/65 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-xl bg-white shadow-2xl">
        <img src={fieldMeta[item.linhVuc].image} alt="" className="h-48 w-full object-cover" />
        <div className="p-5 sm:p-7">
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
            <button className="rounded-md border border-[var(--line)] px-3 py-2 text-sm font-black" onClick={close}>
              Đóng
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Metric label="Quan tâm" value={String(item.quanTam)} />
            <Metric label="Ngày nộp" value={item.ngayNop} />
          </div>
          <div className="mt-6 space-y-5 text-sm leading-7 text-[var(--navy-800)]">
            <ContentBlock title="Nội dung tóm tắt" text={item.tomTat} />
            <ContentBlock title="Hiệu quả dự kiến" text={item.hieuQua} />
          </div>
          {canInteract && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-md bg-[var(--green-600)] px-4 py-3 text-sm font-black text-white" onClick={like}>
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
      </div>
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
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  messages: { from: string; text: string }[];
  input: string;
  setInput: (value: string) => void;
  send: (text: string) => void;
}) {
  const prompts = [
    "Gợi ý cho tôi sáng kiến về tiết kiệm KHCN-ĐMST",
    "Ban Quản trị nguồn nhân lực thì nên làm sáng kiến gì?",
  ];

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-5 sm:right-5">
      {open && (
        <section className="card mb-3 flex h-[min(560px,calc(100vh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:w-[390px]">
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
                {message.text}
              </div>
            ))}
          </div>
          <form className="flex gap-2 border-t border-[var(--line)] p-3" onSubmit={(event) => { event.preventDefault(); send(input); }}>
            <input className="min-w-0 flex-1 rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--green-600)]" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Nhập câu hỏi..." />
            <button className="rounded-md bg-[var(--green-600)] px-3 py-2 text-sm font-black text-white">Gửi</button>
          </form>
        </section>
      )}
      <button className="grid h-13 w-13 place-items-center rounded-full bg-[var(--green-600)] text-white shadow-xl shadow-green-900/25 ring-4 ring-white sm:h-14 sm:w-14" onClick={() => setOpen(!open)} aria-label="Mở trợ lý AI">
        <Bot className="h-7 w-7" />
      </button>
    </div>
  );
}

function PageFrame({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="app-container py-8 lg:py-12">
      <SectionTitle eyebrow={eyebrow} title={title} />
      {children}
    </section>
  );
}

function SectionTitle({ eyebrow, title, icon: Icon = Sparkles }: { eyebrow?: string; title: string; icon?: LucideIcon }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      {eyebrow ? (
        <div>
          <p className="text-xs font-black uppercase text-[var(--green-600)]">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-black leading-tight text-[var(--navy-900)] sm:text-3xl">{title}</h2>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-black leading-tight text-[var(--navy-900)]">{title}</h2>
          <Icon className="h-5 w-5 text-[var(--green-600)]" />
        </>
      )}
    </div>
  );
}

function ActionTile({ icon: Icon, title, description, locked, onClick }: { icon: LucideIcon; title: string; description: string; locked: boolean; onClick: () => void }) {
  return (
    <button className="card-soft focus-ring rounded-xl p-4 text-left transition hover:-translate-y-0.5 hover:bg-white" onClick={onClick}>
      <Icon className="h-8 w-8 text-[var(--green-600)]" />
      <p className="mt-3 font-black">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{description}</p>
      {locked && (
        <p className="mt-3 flex items-center gap-1 text-xs font-black text-[var(--muted)]">
          <Lock className="h-3.5 w-3.5" />
          Khóa đến khi đăng nhập
        </p>
      )}
    </button>
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

function WordCloud() {
  const words = ["Chuyển đổi số", "Tiết kiệm năng lượng", "An toàn lao động", "Quy trình", "Dữ liệu", "Sản xuất xanh", "Tự động hóa", "Quản trị", "Văn hóa số"];
  return (
    <div className="grid min-h-48 place-items-center rounded-xl bg-[var(--mist)] p-4 text-center">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        {words.map((word, index) => (
          <span key={word} className={`${index < 2 ? "text-2xl sm:text-3xl" : index < 5 ? "text-sm" : "text-xs"} font-black`} style={{ color: index % 3 === 0 ? "var(--green-600)" : index % 3 === 1 ? "var(--blue-700)" : "var(--cyan-500)" }}>
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ total, fieldCounts, compact = false }: { total: number; fieldCounts: readonly (readonly [Field, number])[]; compact?: boolean }) {
  const colors = fieldCounts.map(([field]) => fieldMeta[field].color);
  let current = 0;
  const segments = fieldCounts
    .map(([, count], index) => {
      const start = current;
      const size = total === 0 ? 0 : (count / total) * 100;
      current += size;
      return `${colors[index]} ${start}% ${current}%`;
    })
    .join(", ");
  return (
    <div className={`mx-auto grid ${compact ? "h-40 w-40" : "h-48 w-48"} place-items-center rounded-full`} style={{ background: `conic-gradient(${segments || "var(--line) 0 100%"})` }}>
      <div className="grid h-[68%] w-[68%] place-items-center rounded-full bg-white text-center">
        <div>
          <p className="text-3xl font-black">{total}</p>
          <p className="text-xs font-bold text-[var(--muted)]">sáng kiến</p>
        </div>
      </div>
    </div>
  );
}

function FilterBar({ selectedDepartment, selectedField, selectedStatus, searchQuery, setSelectedDepartment, setSelectedField, setSelectedStatus, setSearchQuery }: { selectedDepartment: string; selectedField: string; selectedStatus: string; searchQuery: string; setSelectedDepartment: (value: string) => void; setSelectedField: (value: string) => void; setSelectedStatus: (value: string) => void; setSearchQuery: (value: string) => void }) {
  return (
    <div className="card sticky top-[76px] z-20 grid gap-3 rounded-xl p-4 md:grid-cols-[1fr_1fr_1fr_1.2fr]">
      <Select label="Phòng ban" value={selectedDepartment} onChange={setSelectedDepartment} options={["Tất cả", ...departments]} />
      <Select label="Lĩnh vực" value={selectedField} onChange={setSelectedField} options={["Tất cả", ...fields]} />
      <Select label="Trạng thái" value={selectedStatus} onChange={setSelectedStatus} options={statuses} />
      <label>
        <span className="flex items-center gap-2 text-xs font-black uppercase text-[var(--muted)]"><Filter className="h-3.5 w-3.5" /> Tìm kiếm</span>
        <input className="mt-2 w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm font-semibold outline-none focus:border-[var(--green-600)]" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tên, tác giả, nội dung..." />
      </label>
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

function FieldInput({ label, value, onChange, placeholder, wide = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; wide?: boolean }) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="text-sm font-black">{label}</span>
      <input className="mt-2 w-full rounded-md border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--green-600)]" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
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
  return (
    <label className="mt-4 block">
      <span className="text-sm font-black">{label}</span>
      <textarea
        className="mt-2 min-h-32 w-full resize-y rounded-md border border-black/10 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[#2E3D8F]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[var(--line)] p-5 sm:p-7">
      <h3 className="mb-4 text-lg font-black text-[var(--navy-900)]">{title}</h3>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
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
    <footer className="mt-8 bg-[linear-gradient(135deg,var(--navy-900),#123f6c)] px-4 py-12 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase text-white/60">Người thắp lửa đổi mới</p>
        <h2 className="mt-2 text-3xl font-black leading-tight">Những câu chuyện tạo động lực thi đua.</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {innovators.map((person) => (
            <article key={person.ten} className="overflow-hidden rounded-xl border border-white/12 bg-white/10">
              <img src={person.image} alt="" className="h-36 w-full object-cover" />
              <div className="p-4">
                <p className="font-black">{person.ten}</p>
                <p className="mt-1 text-sm text-white/70">{person.donVi} • {person.count} sáng kiến</p>
                <p className="mt-3 text-sm leading-6 text-white/82">{person.quote}</p>
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--navy-950)]/60 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <Lock className="h-9 w-9 text-[var(--green-600)]" />
        <h3 className="mt-4 text-2xl font-black">Cần đăng nhập tài khoản Tập đoàn</h3>
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
          <p className="mt-1 text-sm text-[var(--muted)]">Tác giả: {form.tacGia || "Chưa nhập"}{form.dongTacGia ? `; ${form.dongTacGia}` : ""}</p>
          <ContentBlock title="Nội dung tóm tắt" text={form.tomTat || "Chưa nhập"} />
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
