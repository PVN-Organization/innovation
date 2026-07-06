"use client";

import { FormEvent, useMemo, useState } from "react";

import { DEMO_OTP, useInitiativeForm } from "@/hooks/useInitiativeForm";
import { useInitiatives } from "@/hooks/useInitiatives";
import type { Field, FormState, Initiative, Status } from "@/lib/types";

type Role = "guest" | "admin";
type View = "landing" | "dashboard" | "form" | "admin";

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
    donVi: "Ban Kỹ thuật Sản xuất",
    quote: "Sáng kiến tốt bắt đầu từ một bất tiện nhỏ được nhìn đủ kỹ.",
  },
  {
    ten: "Trần Hải Yến",
    donVi: "Ban Chuyển đổi số",
    quote: "Dữ liệu không thay con người, dữ liệu giúp chúng ta quyết định tự tin hơn.",
  },
  {
    ten: "Lê Thu Hương",
    donVi: "Văn phòng Công đoàn",
    quote: "Đổi mới trong công đoàn là làm cho việc tốt trở nên dễ lặp lại.",
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

  const [role, setRole] = useState<Role>("guest");
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
    otpSentTo,
    editingId,
    updateForm,
    sendOtp,
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
      <Navigation role={role} view={view} loginAdmin={loginAdmin} logout={logout} go={go} />

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
          otpSentTo={otpSentTo}
          updateForm={updateForm}
          sendOtp={sendOtp}
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
  role,
  view,
  loginAdmin,
  logout,
  go,
}: {
  role: Role;
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
          {!isAdmin ? (
            <button
              className="rounded-md bg-[#32B34A] px-4 py-2 text-sm font-black text-white shadow-md shadow-[#32B34A]/20"
              onClick={loginAdmin}
              title="Đăng nhập quản trị bằng Azure AD"
            >
              Đăng nhập
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
  otpSentTo,
  updateForm,
  sendOtp,
  submitInitiative,
  exportDocx,
  clearForm,
  message,
  editingId,
}: {
  form: FormState;
  otpSentTo: string;
  updateForm: (key: keyof FormState, value: string) => void;
  sendOtp: () => void;
  submitInitiative: (event: FormEvent<HTMLFormElement>) => void;
  exportDocx: () => void;
  clearForm: () => void;
  message: string;
  editingId: number | null;
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
