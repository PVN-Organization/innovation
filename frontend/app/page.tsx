"use client";

import { FormEvent, useMemo, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useInitiativeForm, DEPARTMENTS } from "@/hooks/useInitiativeForm";
import type { AuthorMode } from "@/hooks/useInitiativeForm";
import { useInitiatives } from "@/hooks/useInitiatives";
import type { AuthorEntry, Field, FormState, Initiative, Status } from "@/lib/types";

type Role = "guest" | "admin";
type View = "landing" | "dashboard" | "form" | "admin";

const fields: Field[] = ["Công nghệ", "Quy trình", "An toàn", "Môi trường", "Khác"];
const departments = DEPARTMENTS;

const innovators = [
  {
    ten: "Nguyễn Minh Anh",
    donVi: "Ban Thăm dò - Khai thác Dầu khí",
    quote: "Sáng kiến tốt bắt đầu từ một bất tiện nhỏ được nhìn đủ kỹ.",
  },
  {
    ten: "Trần Hải Yến",
    donVi: "Ban Khoa học Công nghệ & Chuyển đổi số",
    quote: "Dữ liệu không thay con người, dữ liệu giúp chúng ta quyết định tự tin hơn.",
  },
  {
    ten: "Lê Thu Hương",
    donVi: "Văn phòng Tập đoàn",
    quote: "Đổi mới trong công đoàn là làm cho việc tốt trở nên dễ lặp lại.",
  },
];

export default function Home() {
  const { user: authUser, loading: authLoading, login, logout } = useAuth();

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
  const [selectedDepartment, setSelectedDepartment] = useState("Tất cả");
  const [selectedField, setSelectedField] = useState("Tất cả");
  const [adminDepartment, setAdminDepartment] = useState("Tất cả");
  const [adminField, setAdminField] = useState("Tất cả");
  const [adminStatus, setAdminStatus] = useState("Tất cả");
  const [page, setPage] = useState(1);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
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
  } = useInitiativeForm({
    initiatives,
    addLocal,
    updateLocal,
    refreshInitiatives,
    onCancel: () => setView("dashboard"),
  });

  const canAdmin = role === "admin";

  const publicFiltered = useMemo(
    () =>
      initiatives.filter(
        (item) =>
          (selectedDepartment === "Tất cả" || item.donVi === selectedDepartment) &&
          (selectedField === "Tất cả" || item.linhVuc === selectedField),
      ),
    [initiatives, selectedDepartment, selectedField],
  );

  const departmentCounts = useMemo(() => {
    const counts = initiatives.reduce<Record<string, number>>((acc, item) => {
      acc[item.donVi] = (acc[item.donVi] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [initiatives]);

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

  const dashboardItems = publicFiltered.slice().sort((a, b) => b.quanTam - a.quanTam);
  const pagedItems = dashboardItems.slice((page - 1) * 5, page * 5);
  const totalPages = Math.max(1, Math.ceil(dashboardItems.length / 5));

  const adminItems = initiatives.filter(
    (item) =>
      (adminDepartment === "Tất cả" || item.donVi === adminDepartment) &&
      (adminField === "Tất cả" || item.linhVuc === adminField) &&
      (adminStatus === "Tất cả" || item.trangThai === adminStatus),
  );

  const maxDepartment = Math.max(...departmentCounts.map(([, count]) => count), 1);
  const maxField = Math.max(...fieldCounts.map(([, count]) => count), 1);

  function handleLogout() {
    logout();
    setView("landing");
    setSelectedInitiative(null);
    setChatOpen(false);
  }

  function go(nextView: View) {
    if (nextView === "admin" && !canAdmin) return;
    setView(nextView);
  }

  function likeInitiative(id: number) {
    optimisticLike(id);
    setSelectedInitiative((item) =>
      item?.id === id ? { ...item, quanTam: item.quanTam + 1 } : item,
    );
  }

  function openDetails(item: Initiative) {
    setSelectedInitiative(item);
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
      <Navigation
        view={view}
        go={go}
        isLoggedIn={isLoggedIn}
        canAdmin={canAdmin}
        userName={authUser?.name || authUser?.email || ""}
        onLogin={login}
        onLogout={handleLogout}
      />

      {view === "landing" && (
        <>
          <Hero go={go} />
          <EditorialStrip />
          <LandingDashboard
            filtered={publicFiltered}
            departmentCounts={departmentCounts}
            fieldCounts={fieldCounts}
            leaderBoard={leaderBoard}
            selectedDepartment={selectedDepartment}
            selectedField={selectedField}
            setSelectedDepartment={setSelectedDepartment}
            setSelectedField={setSelectedField}
            maxDepartment={maxDepartment}
            maxField={maxField}
            openDetails={openDetails}
          />
          <HonorFooter />
        </>
      )}

      {view === "dashboard" && (
        <DetailedDashboard
          items={pagedItems}
          page={page}
          totalPages={totalPages}
          selectedDepartment={selectedDepartment}
          selectedField={selectedField}
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
          updateForm={updateForm}
          authorMode={authorMode}
          onModeChange={handleModeChange}
          updateAuthor={updateAuthor}
          addAuthor={addAuthor}
          removeAuthor={removeAuthor}
          submitInitiative={submitInitiative}
          exportDocx={exportDocx}
          clearForm={clearForm}
          message={formMessage}
          editingId={editingId}
        />
      )}

      {view === "admin" && canAdmin && (
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
          close={() => setSelectedInitiative(null)}
          like={() => likeInitiative(selectedInitiative.id)}
        />
      )}

      <Chatbot
        open={chatOpen}
        setOpen={setChatOpen}
        messages={chatMessages}
        input={chatInput}
        setInput={setChatInput}
        send={sendChat}
      />

      {formMessage && view === "landing" && (
        <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-lg border border-[#2E3D8F]/20 bg-white p-4 text-sm font-bold text-[#2E3D8F] shadow-xl">
          {formMessage}
        </div>
      )}
    </main>
  );
}

function Navigation({
  view,
  go,
  isLoggedIn,
  canAdmin,
  userName,
  onLogin,
  onLogout,
}: {
  view: View;
  go: (view: View) => void;
  isLoggedIn: boolean;
  canAdmin: boolean;
  userName: string;
  onLogin: () => void;
  onLogout: () => void;
}) {
  const navItems: { id: View; label: string; visible: boolean }[] = [
    { id: "landing", label: "Trang chủ", visible: true },
    { id: "form", label: "Đăng ký sáng kiến", visible: true },
    { id: "admin", label: "Quản trị", visible: canAdmin },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-3">
          <button className="flex items-center gap-3 text-left" onClick={() => go("landing")}>
            <img
              src="/logo-pvn.png"
              alt="Logo Petrovietnam"
              className="h-12 w-auto object-contain"
            />
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.13em] text-[#697386]">
                Công đoàn BM QL&ĐH Petrovietnam
              </span>
              <span className="block text-sm font-black sm:text-lg">
                CỔNG THÔNG TIN SÁNG KIẾN
              </span>
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          {!isLoggedIn ? (
            <button
              className="rounded-md bg-[#32B34A] px-4 py-2 text-sm font-black text-white shadow-md shadow-[#32B34A]/20"
              onClick={onLogin}
              title="Đăng nhập bằng Azure AD"
            >
              Đăng nhập
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-white px-3 py-2 text-sm font-bold text-[#485466]">
                {userName}
              </span>
              {canAdmin && (
                <span className="rounded-md bg-[#2E3D8F]/10 px-2 py-1 text-xs font-bold text-[#2E3D8F]">
                  Admin
                </span>
              )}
              <button
                className="rounded-md border border-[#2E3D8F]/15 bg-white px-3 py-2 text-sm font-black text-[#2E3D8F]"
                onClick={onLogout}
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

function Hero({ go }: { go: (view: View) => void }) {
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
            KIẾN TẠO GIÁ TRỊ MỚI.
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
      </div>
    </section>
  );
}

function EditorialStrip() {
  const stats = [
    { value: "10", label: "sáng kiến mẫu ngành Dầu khí" },
    { value: "5", label: "lĩnh vực đổi mới trọng tâm" },
    { value: "891", label: "lượt quan tâm mô phỏng" },
  ];

  return (
    <section className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 sm:px-6">
      <div className="premium-card grid overflow-hidden rounded-lg md:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`p-6 ${index > 0 ? "border-t border-black/10 md:border-l md:border-t-0" : ""}`}
          >
            <p className="text-4xl font-black text-[#2E3D8F]">{stat.value}</p>
            <p className="mt-2 text-sm font-bold leading-6 text-[#667085]">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LandingDashboard({
  filtered,
  departmentCounts,
  fieldCounts,
  leaderBoard,
  selectedDepartment,
  selectedField,
  setSelectedDepartment,
  setSelectedField,
  maxDepartment,
  maxField,
  openDetails,
}: {
  filtered: Initiative[];
  departmentCounts: [string, number][];
  fieldCounts: readonly (readonly [Field, number])[];
  leaderBoard: { ten: string; donVi: string; soSangKien: number }[];
  selectedDepartment: string;
  selectedField: string;
  setSelectedDepartment: (value: string) => void;
  setSelectedField: (value: string) => void;
  maxDepartment: number;
  maxField: number;
  openDetails: (item: Initiative) => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#32B34A]">
            Tổng quan sáng kiến
          </p>
          <h3 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            Bức tranh thi đua, dữ liệu và ý tưởng nổi bật.
          </h3>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-5" title="Top Ban/Văn phòng có nhiều sáng kiến nhất">
          <div className="space-y-4">
            {departmentCounts.map(([name, count]) => (
              <button
                key={name}
                className={`w-full rounded-md border p-3 text-left transition ${
                  selectedDepartment === name
                    ? "border-[#2E3D8F] bg-[#EEF1FF]"
                    : "border-black/10 bg-white hover:bg-[#F5F7FA]"
                }`}
                onClick={() => setSelectedDepartment(name)}
              >
                <div className="flex items-center justify-between gap-3 text-sm font-bold">
                  <span>{name}</span>
                  <span>{count}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#e7ebe8]">
                  <div
                    className="h-2 rounded-full bg-[#2E3D8F]"
                    style={{ width: `${(count / maxDepartment) * 100}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-3" title="Top cá nhân xuất sắc">
          <div className="space-y-3">
            {leaderBoard.map((person, index) => (
              <div key={person.ten} className="flex items-center gap-3 rounded-md bg-[#F5F7FA] p-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#2E3D8F] text-sm font-black text-white">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{person.ten}</p>
                  <p className="truncate text-xs text-[#667085]">
                    {person.soSangKien} sáng kiến • {person.donVi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-4" title="Tỷ lệ sáng kiến theo lĩnh vực">
          <div className="mb-5 grid aspect-square place-items-center rounded-full border-[18px] border-[#2E3D8F] bg-[#EEF1FF] text-center shadow-inner">
            <div>
              <p className="text-4xl font-black text-[#32B34A]">{filtered.length}</p>
              <p className="text-xs font-bold text-[#667085]">sáng kiến</p>
            </div>
          </div>
          <div className="space-y-3">
            {fieldCounts.map(([field, count]) => (
              <button
                key={field}
                className={`w-full rounded-md p-2 text-left ${selectedField === field ? "bg-[#EEF1FF]" : "bg-white"}`}
                onClick={() => setSelectedField(field)}
              >
                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span>{field}</span>
                  <span>{count}</span>
                </div>
                <div className="h-2 rounded-full bg-[#e7ebe8]">
                  <div
                    className="h-2 rounded-full bg-[#32B34A]"
                    style={{ width: `${count === 0 ? 3 : (count / maxField) * 100}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="mt-4" title="Top sáng kiến được quan tâm nhiều nhất">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered
            .slice()
            .sort((a, b) => b.quanTam - a.quanTam)
            .slice(0, 6)
            .map((item) => (
              <InitiativeCard key={item.id} item={item} openDetails={openDetails} />
            ))}
        </div>
      </Panel>
    </section>
  );
}

function DetailedDashboard({
  items,
  page,
  totalPages,
  selectedDepartment,
  selectedField,
  setSelectedDepartment,
  setSelectedField,
  setPage,
  openDetails,
  likeInitiative,
}: {
  items: Initiative[];
  page: number;
  totalPages: number;
  selectedDepartment: string;
  selectedField: string;
  setSelectedDepartment: (value: string) => void;
  setSelectedField: (value: string) => void;
  setPage: (value: number) => void;
  openDetails: (item: Initiative) => void;
  likeInitiative: (id: number) => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <SectionHeader
        eyebrow="Danh sách sáng kiến"
        title="Dashboard chi tiết sáng kiến"
        description="Theo dõi toàn bộ sáng kiến, mở chi tiết từng dòng và bấm Quan tâm để ghi nhận mức độ hưởng ứng."
      />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Select label="Phòng ban" value={selectedDepartment} onChange={(value) => { setSelectedDepartment(value); setPage(1); }} options={["Tất cả", ...departments]} />
        <Select label="Lĩnh vực" value={selectedField} onChange={(value) => { setSelectedField(value); setPage(1); }} options={["Tất cả", ...fields]} />
        <div className="hairline-card rounded-lg p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#667085]">Phân trang</p>
          <div className="mt-3 flex items-center justify-between">
            <button className="rounded-md border border-black/10 px-3 py-2 text-sm font-bold" onClick={() => setPage(Math.max(1, page - 1))}>
              Trước
            </button>
            <span className="text-sm font-black">Trang {page}/{totalPages}</span>
            <button className="rounded-md border border-black/10 px-3 py-2 text-sm font-bold" onClick={() => setPage(Math.min(totalPages, page + 1))}>
              Sau
            </button>
          </div>
        </div>
      </div>

      <div className="premium-card overflow-hidden rounded-lg">
        <div className="hidden grid-cols-[1.6fr_0.8fr_1fr_0.7fr_0.7fr] gap-3 bg-[#2E3D8F] px-4 py-3 text-sm font-black text-white md:grid">
          <span>Tên sáng kiến</span>
          <span>Lĩnh vực</span>
          <span>Đơn vị</span>
          <span>Trạng thái</span>
          <span>Quan tâm</span>
        </div>
        {items.map((item) => (
          <div
            key={item.id}
            className="grid gap-3 border-t border-black/10 px-4 py-4 md:grid-cols-[1.6fr_0.8fr_1fr_0.7fr_0.7fr] md:items-center"
          >
            <button className="text-left font-black text-[#2E3D8F] hover:text-[#2E3D8F]" onClick={() => openDetails(item)}>
              {item.ten}
              <span className="mt-1 block text-xs font-bold text-[#667085]">{item.tacGia} • {item.ngayNop}</span>
            </button>
            <Badge>{item.linhVuc}</Badge>
            <span className="text-sm font-bold text-[#5c6576]">{item.donVi}</span>
            <StatusBadge status={item.trangThai} />
            <button className="w-fit rounded-md bg-[#F0FBF2] px-3 py-2 text-sm font-black text-[#32B34A]" onClick={() => likeInitiative(item.id)}>
              ♥ {item.quanTam}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function InitiativeForm({
  form,
  updateForm,
  authorMode,
  onModeChange,
  updateAuthor,
  addAuthor,
  removeAuthor,
  submitInitiative,
  exportDocx,
  clearForm,
  message,
  editingId,
}: {
  form: FormState;
  updateForm: (key: keyof FormState, value: string) => void;
  authorMode: AuthorMode;
  onModeChange: (mode: AuthorMode) => void;
  updateAuthor: (index: number, field: keyof AuthorEntry, value: string) => void;
  addAuthor: () => void;
  removeAuthor: (index: number) => void;
  submitInitiative: (event: FormEvent<HTMLFormElement>) => void;
  exportDocx: () => void;
  clearForm: () => void;
  message: string;
  editingId: number | null;
}) {
  const inputClass =
    "mt-1 w-full rounded-md border border-[#2E3D8F]/16 bg-white px-4 py-3 text-base outline-none transition focus:border-[#32B34A] focus:ring-4 focus:ring-[#32B34A]/10";
  const smallInputClass =
    "mt-1 w-full rounded-md border border-[#2E3D8F]/16 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#32B34A] focus:ring-4 focus:ring-[#32B34A]/10";
  const selectClass =
    "mt-1 w-full rounded-md border border-[#2E3D8F]/16 bg-white px-4 py-3 text-base font-bold text-[#243047] outline-none transition focus:border-[#32B34A] focus:ring-4 focus:ring-[#32B34A]/10";

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
        {/* ── I. THÔNG TIN CHUNG ───────────────────────────────── */}
        <div className="border-b border-[#2E3D8F]/10 bg-white px-5 py-5 sm:px-7">
          <h3 className="text-xl font-black text-[#2E3D8F]">I. Thông tin chung</h3>
        </div>

        <div className="grid gap-x-5 gap-y-5 px-5 py-6 sm:px-7 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-black text-[#263451]">Tên sáng kiến <span className="text-red-500">*</span></span>
            <input
              className={inputClass}
              value={form.ten}
              onChange={(event) => updateForm("ten", event.target.value)}
              placeholder="Ví dụ: Tối ưu tiêu thụ năng lượng tại văn phòng"
            />
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#263451]">Lĩnh vực <span className="text-red-500">*</span></span>
            <select
              className={selectClass}
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
            <span className="text-sm font-black text-[#263451]">Ban <span className="text-red-500">*</span></span>
            <select
              className={selectClass}
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
            <span className="text-sm font-black text-[#263451]">Email liên hệ <span className="text-red-500">*</span></span>
            <input
              className={inputClass}
              value={form.email}
              onChange={(event) => updateForm("email", event.target.value)}
              placeholder="name@pvn.vn"
              type="email"
            />
          </label>

          <div className="block md:col-span-2">
            <span className="text-sm font-black text-[#263451]">Thời gian nghiên cứu, áp dụng thử</span>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-[#667085]">Từ</span>
                <input
                  className={inputClass}
                  type="date"
                  value={form.thoiGianTu}
                  onChange={(event) => updateForm("thoiGianTu", event.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-xs text-[#667085]">Đến</span>
                <input
                  className={inputClass}
                  type="date"
                  value={form.thoiGianDen}
                  onChange={(event) => updateForm("thoiGianDen", event.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        {/* ── TÁC GIẢ ──────────────────────────────────────────── */}
        <div className="border-y border-[#2E3D8F]/10 px-5 py-6 sm:px-7">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-black text-[#2E3D8F]">
              Tác giả sáng kiến <span className="text-red-500">*</span>
            </h3>
            <div className="inline-flex rounded-lg border border-[#2E3D8F]/15 bg-[#F8FAFC] p-1">
              <button
                type="button"
                className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                  authorMode === "solo"
                    ? "bg-[#2E3D8F] text-white shadow-sm"
                    : "text-[#667085] hover:text-[#2E3D8F]"
                }`}
                onClick={() => onModeChange("solo")}
              >
                Tác giả duy nhất
              </button>
              <button
                type="button"
                className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                  authorMode === "team"
                    ? "bg-[#2E3D8F] text-white shadow-sm"
                    : "text-[#667085] hover:text-[#2E3D8F]"
                }`}
                onClick={() => onModeChange("team")}
              >
                Đồng tác giả
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {form.danhSachTacGia.map((author, index) => (
              <div
                key={index}
                className="relative rounded-lg border border-[#2E3D8F]/10 bg-[#F8FAFC] p-4"
              >
                {authorMode === "team" && index > 0 && (
                  <button
                    type="button"
                    className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full border border-red-200 bg-white text-xs font-black text-red-500 transition hover:bg-red-50"
                    aria-label={`Xóa tác giả #${index + 1}`}
                    onClick={() => removeAuthor(index)}
                  >
                    x
                  </button>
                )}
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#667085]">
                  {author.vaiTro}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="block">
                    <span className="text-xs font-bold text-[#263451]">Họ và tên <span className="text-red-500">*</span></span>
                    <input
                      className={smallInputClass}
                      value={author.hoTen}
                      onChange={(e) => updateAuthor(index, "hoTen", e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-[#263451]">Chức vụ</span>
                    <input
                      className={smallInputClass}
                      value={author.chucVu}
                      onChange={(e) => updateAuthor(index, "chucVu", e.target.value)}
                      placeholder="Chuyên viên"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-[#263451]">Đơn vị công tác</span>
                    <input
                      className={`${smallInputClass} ${authorMode === "solo" && index === 0 ? "bg-gray-50 text-gray-500" : ""}`}
                      value={author.donVi}
                      onChange={(e) => updateAuthor(index, "donVi", e.target.value)}
                      readOnly={authorMode === "solo" && index === 0}
                      tabIndex={authorMode === "solo" && index === 0 ? -1 : undefined}
                      placeholder="Ban Kỹ thuật"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-[#263451]">Điện thoại/Email</span>
                    <input
                      className={`${smallInputClass} ${authorMode === "solo" && index === 0 ? "bg-gray-50 text-gray-500" : ""}`}
                      value={author.email}
                      onChange={(e) => updateAuthor(index, "email", e.target.value)}
                      readOnly={authorMode === "solo" && index === 0}
                      tabIndex={authorMode === "solo" && index === 0 ? -1 : undefined}
                      placeholder="0912... / email@pvn.vn"
                    />
                  </label>
                </div>
              </div>
            ))}

            {authorMode === "team" && (
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#2E3D8F]/20 py-3 text-sm font-bold text-[#2E3D8F] transition hover:border-[#2E3D8F]/40 hover:bg-[#EEF1FF]/50"
                onClick={addAuthor}
              >
                <span className="text-lg leading-none">+</span> Thêm tác giả
              </button>
            )}
          </div>
        </div>

        {/* ── II-III. LÝ DO & MỤC TIÊU ────────────────────────── */}
        <div className="border-y border-[#2E3D8F]/10 bg-[#F8FAFC] px-5 py-6 sm:px-7">
          <h3 className="mb-4 text-xl font-black text-[#2E3D8F]">II. Lý do đề xuất & Mục tiêu</h3>
          <div className="grid gap-5">
            <TextArea
              label="Lý do đề xuất sáng kiến"
              required
              value={form.lyDo}
              onChange={(value) => updateForm("lyDo", value)}
              placeholder="Trình bày lý do, bối cảnh dẫn đến việc đề xuất sáng kiến..."
            />
            <TextArea
              label="Mục tiêu của sáng kiến"
              required
              value={form.mucTieu}
              onChange={(value) => updateForm("mucTieu", value)}
              placeholder="Nêu rõ mục tiêu mà sáng kiến hướng tới giải quyết..."
            />
          </div>
        </div>

        {/* ── IV. NỘI DUNG SÁNG KIẾN ──────────────────────────── */}
        <div className="border-b border-[#2E3D8F]/10 px-5 py-6 sm:px-7">
          <h3 className="mb-4 text-xl font-black text-[#2E3D8F]">IV. Nội dung sáng kiến</h3>
          <div className="grid gap-5">
            <TextArea
              label="1. Thực trạng trước khi áp dụng sáng kiến"
              required
              value={form.thucTrang}
              onChange={(value) => updateForm("thucTrang", value)}
              placeholder="Mô tả thực trạng, vấn đề thực tế cần giải quyết..."
            />
            <TextArea
              label="2. Giải pháp mới được đề xuất"
              required
              value={form.giaiPhap}
              onChange={(value) => updateForm("giaiPhap", value)}
              placeholder="Trình bày chi tiết giải pháp, phương pháp mới..."
            />
            <TextArea
              label="3. Cách thức áp dụng"
              required
              value={form.cachThuc}
              onChange={(value) => updateForm("cachThuc", value)}
              placeholder="Mô tả quy trình, các bước triển khai áp dụng sáng kiến..."
            />
          </div>
        </div>

        {/* ── V-VII. HIỆU QUẢ & ĐÁNH GIÁ ─────────────────────── */}
        <div className="border-b border-[#2E3D8F]/10 bg-[#F8FAFC] px-5 py-6 sm:px-7">
          <h3 className="mb-4 text-xl font-black text-[#2E3D8F]">V. Hiệu quả & Đánh giá</h3>
          <div className="grid gap-5">
            <TextArea
              label="Hiệu quả đạt được"
              required
              value={form.hieuQua}
              onChange={(value) => updateForm("hieuQua", value)}
              placeholder="Nêu hiệu quả về chi phí, thời gian, an toàn, môi trường hoặc chất lượng..."
            />
            <TextArea
              label="Tính mới của sáng kiến"
              value={form.tinhMoi}
              onChange={(value) => updateForm("tinhMoi", value)}
              placeholder="Nêu điểm mới, sáng tạo so với giải pháp hiện có (nếu có)..."
            />
            <TextArea
              label="Khả năng áp dụng và nhân rộng"
              value={form.nhanRong}
              onChange={(value) => updateForm("nhanRong", value)}
              placeholder="Đánh giá khả năng triển khai rộng rãi tại các đơn vị khác (nếu có)..."
            />
          </div>
        </div>

        {/* ── Tóm tắt ─────────────────────────────────────────── */}
        <div className="grid gap-5 px-5 py-6 sm:px-7">
          <TextArea
            label="Nội dung tóm tắt"
            value={form.tomTat}
            onChange={(value) => updateForm("tomTat", value)}
            placeholder="Mô tả ngắn gọn toàn bộ sáng kiến (hiển thị trên danh sách công khai)..."
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
            Gửi Sáng Kiến
          </button>
        </div>
      </form>
    </section>
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
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <SectionHeader
        eyebrow="Admin Portal"
        title="Kho dữ liệu Sáng kiến"
        description="Quản trị toàn bộ sáng kiến, lọc theo phòng ban, lĩnh vực, trạng thái phê duyệt và xuất dữ liệu báo cáo."
      />
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Select label="Phòng ban" value={department} onChange={setDepartment} options={["Tất cả", ...departments]} />
        <Select label="Lĩnh vực" value={field} onChange={setField} options={["Tất cả", ...fields]} />
        <Select label="Trạng thái phê duyệt" value={status} onChange={setStatus} options={["Tất cả", "Chờ duyệt", "Đã duyệt"]} />
        <div className="hairline-card rounded-lg p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#667085]">Xuất dữ liệu</p>
          <button className="mt-3 w-full rounded-md bg-[#2E3D8F] px-3 py-2 text-sm font-black text-white" onClick={exportCsv}>
            Xuất dữ liệu Excel/CSV
          </button>
        </div>
      </div>

      <div className="premium-card overflow-x-auto rounded-lg">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="bg-[#2E3D8F] text-white">
            <tr>
              <th className="px-4 py-3">Tên sáng kiến</th>
              <th className="px-4 py-3">Lĩnh vực</th>
              <th className="px-4 py-3">Đơn vị</th>
              <th className="px-4 py-3">Tác giả</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Quan tâm</th>
              <th className="px-4 py-3">Điểm</th>
              <th className="px-4 py-3">Giải thưởng</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-black/10">
                <td className="px-4 py-3 font-black">{item.ten}</td>
                <td className="px-4 py-3">{item.linhVuc}</td>
                <td className="px-4 py-3">{item.donVi}</td>
                <td className="px-4 py-3">{item.tacGia}</td>
                <td className="px-4 py-3">{item.trangThai}</td>
                <td className="px-4 py-3">{item.quanTam}</td>
                <td className="px-4 py-3">{item.diem}</td>
                <td className="px-4 py-3">{item.giaiThuong}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InitiativeCard({
  item,
  openDetails,
}: {
  item: Initiative;
  openDetails: (item: Initiative) => void;
}) {
  const hasAward = item.giaiThuong !== "Chờ xét chọn";

  return (
    <article className="premium-card overflow-hidden rounded-lg transition hover:-translate-y-0.5 hover:shadow-xl">
      <div
        className="h-24 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(90deg, rgba(16,21,34,0.45), rgba(189,17,31,0.12)), url('/hero-innovation.png')" }}
      />
      <div className="p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge>{item.linhVuc}</Badge>
        <StatusBadge status={item.trangThai} />
        {hasAward && <Badge>{item.giaiThuong}</Badge>}
      </div>
      <h5 className="text-lg font-black leading-6">{item.ten}</h5>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#667085]">{item.tomTat}</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 text-sm">
        <span className="min-w-0 font-bold text-[#5c6576]">
          <span className="block text-[#2E3D8F]">{item.tacGia}</span>
          <span className="block text-xs leading-5 text-[#667085]">{item.donVi}</span>
        </span>
        <button className="font-black text-[#32B34A]" onClick={() => openDetails(item)}>
          ♥ {item.quanTam} quan tâm
        </button>
      </div>
      </div>
    </article>
  );
}

function DetailModal({
  item,
  close,
  like,
}: {
  item: Initiative;
  close: () => void;
  like: () => void;
}) {
  const hasAward = item.giaiThuong !== "Chờ xét chọn";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge>{item.linhVuc}</Badge>
              <StatusBadge status={item.trangThai} />
              {hasAward && <Badge>{item.giaiThuong}</Badge>}
            </div>
            <h3 className="text-3xl font-black leading-tight">{item.ten}</h3>
            <p className="mt-2 text-sm font-bold text-[#667085]">
              {item.tacGia}{item.dongTacGia ? `, ${item.dongTacGia}` : ""} • {item.donVi}
            </p>
          </div>
          <button className="rounded-md border border-black/10 px-3 py-2 text-sm font-black" onClick={close}>
            Đóng
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Metric label="Quan tâm" value={String(item.quanTam)} />
          <Metric label="Ngày nộp" value={item.ngayNop} />
        </div>
        <div className="mt-6 space-y-5 text-sm leading-7 text-[#3f4654]">
          <div>
            <h4 className="font-black text-[#2E3D8F]">Nội dung tóm tắt</h4>
            <p className="mt-2">{item.tomTat}</p>
          </div>
          <div>
            <h4 className="font-black text-[#2E3D8F]">Hiệu quả dự kiến</h4>
            <p className="mt-2">{item.hieuQua}</p>
          </div>
        </div>
        <button className="mt-6 rounded-md bg-[#32B34A] px-4 py-3 text-sm font-black text-white" onClick={like}>
          Quan tâm sáng kiến này
        </button>
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
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <section className="premium-card mb-3 flex h-[520px] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
          <header className="bg-[#2E3D8F] px-4 py-3 text-white">
            <h3 className="font-black">Trợ lý AI Sáng kiến</h3>
            <p className="text-xs text-white/70">Gợi ý dựa trên dữ liệu sáng kiến mẫu</p>
          </header>
          <div className="flex-1 space-y-3 overflow-auto p-4">
            <div className="flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button key={prompt} className="rounded-md bg-[#EEF1FF] px-3 py-2 text-left text-xs font-bold text-[#2E3D8F]" onClick={() => send(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
            {messages.map((message, index) => (
              <div key={index} className={`rounded-lg p-3 text-sm leading-6 ${message.from === "bot" ? "bg-[#F5F7FA] text-[#2f3747]" : "ml-8 bg-[#2E3D8F] text-white"}`}>
                {message.text}
              </div>
            ))}
          </div>
          <form
            className="flex gap-2 border-t border-black/10 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <input
              className="min-w-0 flex-1 rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#2E3D8F]"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Nhập câu hỏi..."
            />
            <button className="rounded-md bg-[#32B34A] px-3 py-2 text-sm font-black text-white">
              Gửi
            </button>
          </form>
        </section>
      )}
      <button
        className="grid h-12 w-12 place-items-center rounded-full bg-[#2E3D8F] text-white shadow-xl shadow-[#2E3D8F]/25 ring-4 ring-white sm:h-14 sm:w-14"
        onClick={() => setOpen(!open)}
        aria-label="Mở trợ lý AI"
        title="Trợ lý AI"
      >
        <svg
          aria-hidden="true"
          className="h-6 w-6 sm:h-8 sm:w-8"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 8V5" />
          <path d="M8 5h8" />
          <rect x="5" y="8" width="14" height="10" rx="3" />
          <path d="M8 18v2" />
          <path d="M16 18v2" />
          <path d="M3 12h2" />
          <path d="M19 12h2" />
          <path d="M9 13h.01" />
          <path d="M15 13h.01" />
          <path d="M10 16h4" />
        </svg>
      </button>
    </div>
  );
}

function HonorFooter() {
  return (
    <footer className="bg-[#2E3D8F] px-4 py-14 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/60">Góc Vinh Danh</p>
        <h3 className="mt-3 max-w-2xl text-4xl font-black leading-tight">Những người thắp lửa đổi mới.</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {innovators.map((person, index) => (
            <article key={person.ten} className="overflow-hidden rounded-lg border border-white/10 bg-white/8">
              <img
                src="/hero-innovation.png"
                alt={`Ảnh vinh danh ${person.ten}`}
                className="h-36 w-full object-cover"
                style={{ objectPosition: `${30 + index * 20}% center` }}
              />
              <div className="p-4">
                <p className="font-black">{person.ten}</p>
                <p className="mt-1 text-sm text-white/70">{person.donVi}</p>
                <p className="mt-3 text-sm leading-6 text-white/82">{person.quote}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </footer>
  );
}

function Panel({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`premium-card rounded-lg p-5 ${className}`}>
      <h4 className="mb-5 text-lg font-black">{title}</h4>
      {children}
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#32B34A]">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-black leading-tight">{title}</h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-[#667085]">{description}</p>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="hairline-card block rounded-lg p-4">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#667085]">{label}</span>
      <select
        className="mt-2 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-[#2E3D8F]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function FieldInput({
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
    <label className="block">
      <span className="text-sm font-black">{label}</span>
      <input
        className="mt-2 w-full rounded-md border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-[#2E3D8F]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <textarea
        className="mt-2 min-h-32 w-full resize-y rounded-md border border-black/10 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[#2E3D8F]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-fit rounded-md bg-[#EEF1FF] px-2 py-1 text-xs font-black text-[#2E3D8F]">
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`w-fit rounded-md px-2 py-1 text-xs font-black ${
        status === "Đã duyệt" ? "bg-[#e9f8f3] text-[#007f69]" : "bg-[#fff7ed] text-[#b45309]"
      }`}
    >
      {status}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#F5F7FA] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#667085]">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}
