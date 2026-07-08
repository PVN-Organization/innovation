# Rà soát & Góp ý UI/UX — Cổng thông tin sáng kiến Công đoàn

Cập nhật: 2026-07-07
Phạm vi: rà soát trực tiếp trên **giao diện thật đang chạy** (`npm run dev`, Node 24, duyệt desktop 1440px + mobile 390px), kết hợp đọc code.
Bổ sung cho `cong-thong-tin-sang-kien-design-brief.md` — **không lặp lại** brief đó.
Kim chỉ nam: **đồng bộ + đơn giản + không confuse**.

---

## 1. Tóm tắt điều hành

- Nền tảng đã **đúng hướng**: hệ màu xanh-số nhất quán, hero đúng tinh thần, mobile tốt, luồng AI→form hợp lý. Đây là **tinh chỉnh, không phải làm lại**.
- **Vấn đề gốc = TÍNH ĐỒNG BỘ.** Vì dev từng phần, typography (font/size), căn chỉnh card, minh hoạ và microcopy đang được áp dụng **ngẫu nhiên giữa các cấu phần** → cảm giác "chắp vá" dù từng phần đều ổn.
- 6 việc nên làm trước tiên:
  1. Chốt **thang typography** + component `SectionTitle`/`ChartTitle` dùng lại (hết cảnh chữ to/nhỏ tuỳ nơi).
  2. Dùng **chữ bay bổng nhất quán** cho tiêu đề trang/vùng; bỏ eyebrow trùng navbar; không đặt 2 khối chữ bay bổng cạnh nhau.
  3. **Thuần tiếng Việt** (xoá wordcloud/Podium/Token/Coins/Phase 2/Choose File; ngày dd/mm/yyyy).
  4. **Empty state + error state** tử tế; **chart không "vẽ" khi 0 dữ liệu**.
  5. **Avatar chân dung người thật** cho phần vinh danh; đổi hình "theo lĩnh vực" bắt mắt hơn.
  6. Đồng bộ **căn chỉnh/bo góc/khoảng cách** card & chuẩn hoá control (select/date/file).
- Kết luận: bổ sung một "Design System tối thiểu" và soi mọi cấu phần qua nó sẽ nâng chất lượng cảm nhận rõ rệt mà không đổi kiến trúc.

---

## 2. Design System tối thiểu (nền tảng cho mọi đề xuất bên dưới)

> Mục này giải quyết trực tiếp cảm giác "thiếu đồng bộ". Chốt 1 lần, mọi cấu phần bám theo.

### 2.1. Font — tối đa 3, hiện đang 2 (đạt)

Đo thực tế: toàn web chỉ dùng **Inter** (sans) + **Georgia italic** (bay bổng). Số lượng font OK. Vấn đề là **cách dùng**, không phải số lượng.

| Vai trò | Font | Dùng cho |
|---|---|---|
| Bay bổng (campaign) | Georgia italic 900 (`.campaign-title`) | CHỈ tiêu đề Trang & tiêu đề Vùng |
| Thân | Inter | Tiêu đề panel/chart, body, label, số liệu |
| (Chừa slot thứ 3 nếu sau này cần mono cho số/mã) | — | — |

**Quy tắc chữ bay bổng:**
- Chỉ dùng ở **PageTitle** và **SectionTitle**. Không dùng cho panel/chart/label.
- **Không đặt 2 khối chữ bay bổng cạnh nhau** (gây rối thị giác).

### 2.2. Thang typography cố định (đề xuất)

| Cấp | Font | Size (desktop / mobile) | Weight | Ví dụ |
|---|---|---|---|---|
| PageTitle | Georgia italic | 40 / 30 | 900 | "Phong trào sáng kiến…" |
| Hero | Georgia italic | 72–80 / 34–38 | 900 | "Sáng kiến hôm nay, đột phá ngày mai" |
| SectionTitle | Georgia italic | 28 / 24 | 900 | "Trang thống kê cơ bản", "Những câu chuyện…" |
| PanelTitle / ChartTitle | Inter | **18 / 16 (cố định 1 giá trị)** | 700–800 | "Bảng thi đua", "Sáng kiến theo lĩnh vực" |
| Body | Inter | 15–16 | 400–600 | nội dung |
| Caption/label | Inter | 12–13 | 600 | nhãn số liệu, chú thích |

**Cách thực thi (khuyến nghị):** tạo 3 component nhỏ `PageTitle`, `SectionTitle`, `PanelTitle` trong `page.tsx` và thay các chỗ gõ class rời. Sau này thêm tiêu đề mới chỉ việc chọn đúng component → không lệch nữa.

### 2.3. Bố cục & style component

- **Radius**: chốt 1 hệ (VD card 14px như `.card`, control 10px, pill 999px). Bỏ trộn `rounded-md/lg/xl/2xl`.
- **Spacing**: dùng bậc 4/8/12/16/24; card cùng hàng **cùng padding + cùng chiều cao tối thiểu**.
- **Control**: chuẩn hoá `select`, `input[type=date]`, `input[type=file]` theo 1 style thống nhất với UI custom (hiện đang dùng native, lệch).
- **Màu**: dùng token trong `globals.css`, tránh hex hardcode trong inline style.

---

## 3. Phát hiện xếp theo tác động

Ký hiệu công: **S** (nhỏ), **M** (vừa), **L** (lớn).

### P0 — Đồng bộ & độ tin cậy (làm trước)

**P0.1 — Typography áp dụng không nhất quán.** *(bằng chứng đo)*
- Tiêu đề vùng lúc bay bổng lúc không: "Trang thống kê cơ bản" = Inter 24px; "Những câu chuyện tạo động lực thi đua." = Georgia italic 30px (cùng cấp, khác font+size).
- Cả trang "Thi đua & Thống kê" **không dùng chữ bay bổng nào** (tiêu đề trang = Inter 30px), trong khi Trang chủ dùng Georgia cho hero + honor.
- Title panel/chart cùng hàng khác size: "Bảng thi đua" 24px vs "Sáng kiến theo lĩnh vực" 16px vs "Top sáng kiến" 16px. "Bảng thi đua" (24px) = tiêu đề section (24px) → xung đột phân cấp.
- Cùng khối "Sáng kiến theo Ban" = 24px ở Trang chủ nhưng 16px ở tab Dữ liệu.
- **Đề xuất:** áp thang §2.2 + component tiêu đề dùng lại. **File:** `frontend/app/page.tsx` (BasicStats ~1119, các panel; PageHero ~983). **Công:** M.

**P0.2 — Thiếu empty state, chart vẫn "vẽ" khi 0 dữ liệu.**
- Khi backend rỗng: Bảng thi đua, Top cá nhân, Top sáng kiến, chart "theo Ban", "Mối quan tâm theo tác giả" là **hộp trắng trống**, không thông báo.
- Donut lĩnh vực hiện **vòng cyan đầy dù 0 sáng kiến**; wordcloud + dải sóng vẫn hiện dù không có dữ liệu → **sai lệch dữ liệu** (nghiêm trọng với sản phẩm thật).
- **Đề xuất:** mỗi vùng có 3 trạng thái loading / empty ("Chưa có sáng kiến — hãy là người đầu tiên") / error; chart 0 dữ liệu → vẽ trạng thái rỗng (viền xám mờ + "Chưa có dữ liệu"), không tô đầy. **File:** `DonutChart ~2739`, `FieldFlowChart ~1227`, `WordCloud ~2708`, `useInitiatives.ts` (không có fallback). **Công:** M.

**P0.3 — Banner đỏ "HTTP 502" khi backend lỗi.** Hiện to toàn trang, trông như app hỏng. **Đề xuất:** đổi thành dải cảnh báo nhẹ (vàng nhạt, chữ ngắn "Đang tải dữ liệu… / Mất kết nối, thử lại") hoặc toast, không dùng nền đỏ full-width. **File:** nơi render lỗi API (client `lib/api/client.ts` + chỗ hiển thị ở `page.tsx`). **Công:** S.

**P0.4 — Còn sót tiếng Anh.** *(bằng chứng đo)* "wordcloud", "Podium", "Token", "Coins", "Phase 2", form "Choose File" (input native), ngày **mm/dd/yyyy (US)**. Xem bảng §4. **Công:** S–M.

### P1 — Trải nghiệm & thẩm mỹ

**P1.1 — Hero.**
- Bỏ **eyebrow** "Cổng thông tin sáng kiến Công đoàn…" phía trên headline (Inter 12px in hoa) vì **trùng thanh navigate**.
- **Ngắt dòng headline có chủ đích**: cố định 2 dòng "Sáng kiến hôm nay," / "đột phá ngày mai" (không để wrap ngẫu nhiên khi co kéo). Cân nhắc bỏ/khoá **headline đổi ngẫu nhiên mỗi lần load** để nhất quán thương hiệu (hoặc chốt 1 câu chính).
- **File:** `page.tsx` LandingPage ~983. **Công:** S.

**P1.2 — Minh hoạ vinh danh = avatar chân dung người thật.** Hiện là avatar chữ viết tắt (MA/HY/TH), thiếu cảm xúc. **Đề xuất:** dùng ảnh chân dung thật (hoặc bộ minh hoạ người nhất quán 1 style). **File:** `.honor-avatar` trong `globals.css` + HonorFooter. **Công:** S (UI) + phụ thuộc nguồn ảnh.

**P1.3 — "Sáng kiến theo lĩnh vực" cần hình bắt mắt hơn.** FieldFlowChart dạng dải sóng hiện **yếu về thẩm mỹ + gây hiểu nhầm khi 0 dữ liệu**. **Đề xuất:** thay bằng donut lớn có nhãn %, hoặc treemap/bubble theo lĩnh vực, bám dữ liệu thật; đồng bộ palette với hero. **File:** `FieldFlowChart ~1227`. **Công:** M.

**P1.4 — Căn chỉnh card/chart chưa đều.** Card cùng hàng cao–thấp lệch, padding không đều; section 3 cột khi rỗng bị lệch; 7 `<select>` native ở tab Dữ liệu lệch phong cách. **Đề xuất:** áp §2.3. **File:** BasicStats, FilterBar, các panel. **Công:** M.

**P1.5 — Form (Biểu mẫu đăng ký sáng kiến).**
- "Stepper 1→5" nhưng thực chất là **1 trang cuộn dài** (ẩn dụ lẫn lộn). **Đề xuất:** hoặc biến thành wizard thật (bấm bước để nhảy), hoặc đổi thành "mục lục cuộn" rõ ràng (click → cuộn tới section, không đánh số như bước).
- Toolbar textarea "• 1. B" target nhỏ → dùng **icon** (bullet/số/bold) rõ hơn.
- Action bar (Hủy / Về danh sách / Gửi) **không sticky** trên form dài → nên sticky đáy, có shadow.
- **Thiếu nút "Xem preview bản Word"** hiện hữu ở action bar.
- "Đơn vị/Phòng ban" (thông tin chung) vs "Đơn vị" (tác giả) dễ nhầm → gộp/đổi nhãn rõ.
- Thêm **success screen** sau khi gửi (mã hồ sơ + trạng thái + nút tải DOCX + xem "Sáng kiến của tôi").
- **File:** InitiativeForm ~2010, `useInitiativeForm.ts`. **Công:** M–L.

**P1.6 — Chatbot.**
- Vùng tin nhắn **không có nền/khung** → chữ bot đè lên trang. **Đề xuất:** cho bong bóng bot có nền (mist/xám nhạt) + panel có nền đặc + shadow.
- Trả lời **tức thì, canned** → lộ "giả". Thêm **typing indicator** + đa dạng phản hồi (tối thiểu), lý tưởng là nối AI thật (xem §6).
- Giữ điểm tốt: suggestion card có cấu trúc + nút "Đưa vào form"/"Tìm tương tự".
- **File:** Chatbot ~2530, `aiAnswer/aiSuggestions ~473–565`. **Công:** S (UI) / L (AI thật).

### P2 — Polish

- Thống nhất bo góc + bỏ hex hardcode (§2.3). **Công:** S.
- Đồng bộ thumbnail lĩnh vực với style hero. **Công:** S.
- Nhãn CTA nhất quán: desktop "Hỏi AI" ↔ mobile "Khám phá với AI" → chọn 1. **Công:** S.
- Card "Phase 2" (Thi đua) đang trông "đầy đủ" hơn tính năng thật → **bỏ hẳn** cùng các thành phần Giai đoạn 2 khác (xem §8 thiết kế lại trang Thi đua). **Công:** S.

---

## 4. Bản đồ tiếng Việt hoá (thuần Việt)

| Hiện tại (Anh) | Đề xuất (Việt) | Nơi thấy |
|---|---|---|
| wordcloud | Đám mây từ khoá / Lĩnh vực trọng tâm | Tab Dữ liệu — title "Lĩnh vực / wordcloud" |
| Podium | Bảng vinh danh / Tốp đầu | Tab Bảng thi đua |
| Token / Coins | Điểm thưởng / Xu thưởng | Card Phase 2 |
| Phase 2 | Giai đoạn 2 | Badge nhiều nơi |
| Choose File / No file chosen | Chọn tệp / Chưa chọn tệp | Form, khu Xuất/Gửi |
| Ngày mm/dd/yyyy | dd/mm/yyyy | Form, Thời gian bắt đầu/kết thúc |

Ghi chú: một số thuật ngữ (KHCN-ĐMST) là viết tắt tiếng Việt hợp lệ, giữ nguyên.

---

## 5. Minh hoạ & hình ảnh

- **Vinh danh:** avatar chân dung người thật (hoặc bộ minh hoạ người cùng 1 style). Tránh chữ viết tắt.
- **"Theo lĩnh vực":** đổi hình bắt mắt (donut lớn có %, treemap, hoặc bubble), bám dữ liệu, đồng bộ palette hero.
- **Thumbnail lĩnh vực:** cùng phong cách (line-weight, màu) với hero để không "mỗi hình một kiểu".
- **Nguyên tắc:** mọi hình minh hoạ nên cùng một "ngôn ngữ thị giác" (độ nét, màu, độ trừu tượng).

---

## 6. (Tuỳ chọn) Chatbot AI thật

Nếu muốn chatbot đúng nghĩa "trợ lý AI":
- Gọi qua **endpoint backend** (FastAPI), **không lộ API key ở frontend**.
- Ngữ cảnh từ **DB sáng kiến** (RAG nhẹ: lấy vài sáng kiến liên quan làm context).
- Giữ nguyên UI **suggestion card + "Đưa vào form"** (đã tốt), thêm **typing indicator** + trạng thái lỗi.
- Provider: cân nhắc Claude/OpenAI (cần chốt — xem §8).

---

## 7. Checklist đồng bộ trước khi dev tiếp

- [ ] Mỗi tiêu đề mới map đúng cấp trong thang §2.2 (dùng component `PageTitle/SectionTitle/PanelTitle`).
- [ ] Mọi chart/panel title **cùng font + cùng size**.
- [ ] Chữ bay bổng chỉ ở PageTitle/SectionTitle; không 2 khối cạnh nhau.
- [ ] Mọi vùng dữ liệu có đủ **loading / empty / error**.
- [ ] Chart **không tô đầy khi 0 dữ liệu**.
- [ ] Không còn chữ tiếng Anh (đối chiếu §4); ngày dd/mm/yyyy.
- [ ] Radius/spacing/chiều cao card theo token; control theo style chung.
- [ ] Card cùng hàng cân nhau; layout rỗng không bị lệch.

---

## 8. Thiết kế lại trang "Thi đua & Thống kê" (bám schema, bỏ Giai đoạn 2)

**Bối cảnh:** trang đang có 3 tab (Tổng quan / Bảng thi đua / Dữ liệu sáng kiến) trùng lặp nhiều; nhiều thành phần dựa vào dữ liệu **không tồn tại** theo schema. Bộ lọc thời gian "Tháng này/Quý này/Năm nay" hiện **không lọc thật** — chỉ đổi label + Pill (đã kiểm chứng trong code: `range` không đụng `ngayNop`). File: `frontend/app/page.tsx` `CompetitionPage` (~1594).

### 8.1. Dữ liệu thật dùng được (bảng `initiatives`)

| Trường (schema) | Dùng cho thi đua |
|---|---|
| `quan_tam` (int) | Lượt quan tâm — tín hiệu "sức nóng" chính |
| `don_vi` (str) | Xếp hạng theo Ban/Văn phòng |
| `tac_gia` + `danh_sach_tac_gia` | Xếp hạng cá nhân (gồm đồng tác giả) |
| `linh_vuc` (enum 5) | Cơ cấu theo lĩnh vực |
| `trang_thai` (Chờ duyệt/Đã duyệt) | Lọc trạng thái |
| `ngay_nop` (datetime) | Lọc thời gian tháng/quý/năm |

**Hai chỉ số xếp hạng thật:** (a) **Số sáng kiến**, (b) **Tổng lượt quan tâm**. Các bảng xếp hạng nên cho **chuyển đổi giữa 2 chỉ số** này.

**Bỏ (Giai đoạn 2 — không có luồng dữ liệu):** `diem` (luôn = 0) và `giai_thuong` (luôn = "Chờ xét chọn"). Giữ cột trong DB nhưng **ẩn khỏi UI** đến khi có luồng chấm điểm/giải thưởng.

### 8.2. Cấu trúc đề xuất (giảm trùng lặp giữa 3 tab)

- **Tổng quan** = ảnh chụp nhanh: KPI band (Tổng SK / Đã duyệt / Chờ duyệt / Lượt quan tâm / Lĩnh vực nổi bật) + 1 biểu đồ lĩnh vực + teaser Top 3 (link sang tab khác). Không lặp full list.
- **Bảng thi đua** = trải nghiệm xếp hạng chính (§8.3).
- **Dữ liệu sáng kiến** = bảng + bộ lọc drill-down (giữ, chuẩn hoá `<select>`/date/file theo §2.3).

### 8.3. Tab "Bảng thi đua" — thiết kế mới

**Thanh điều khiển:**
- Lọc thời gian theo `ngay_nop` — **phải lọc thật** (Tháng này/Quý này/Năm nay). Nếu chưa kịp làm backend → **bỏ control** thay vì để giả.
- Toggle chỉ số: **[Số sáng kiến] / [Lượt quan tâm]** — áp cho podium + bảng xếp hạng.

**A. Podium Top 3 Ban/Văn phòng** (nâng cấp): medal vàng/bạc/đồng, hạng 1 đặt giữa & cao nhất. Mỗi bục hiển thị **cả 2 số** (số SK + lượt quan tâm) + % so tổng. Click → lọc sang tab Dữ liệu.

**B. Bảng xếp hạng đầy đủ (2 cột):**
- **Ban/Văn phòng — hạng 4 trở đi** (nối tiếp podium, tránh lặp); bar theo chỉ số đang chọn.
- **Cá nhân**: avatar + tên + đơn vị + số SK + lượt quan tâm (từ `tac_gia` + `danh_sach_tac_gia`).

**C. Top sáng kiến được quan tâm** (giữ): card sắp theo `quan_tam` giảm dần; nổi bật lượt quan tâm, Pill lĩnh vực, đơn vị, tác giả, trạng thái; nút Quan tâm ngay trên card (có loading).

**D. Cơ cấu lĩnh vực** (thay chỗ trống của card Giai đoạn 2): donut/treemap theo `linh_vuc`, bám dữ liệu thật (0 → trạng thái rỗng, không tô đầy).

**Bỏ khỏi tab này:** "Top Ban/Văn phòng" bị lặp (đã có ở podium + Tổng quan), card **"Giai đoạn 2: điểm thưởng"**, section **"Sáng kiến tiêu biểu" theo giải thưởng**.

### 8.4. Trạng thái & vi tương tác
- Mỗi bảng/biểu đồ có **empty state** ("Chưa có sáng kiến trong kỳ này") + **loading skeleton**; không vẽ chart khi 0 dữ liệu.
- Click hạng → cập nhật bộ lọc + chip filter (đồng bộ cross-filter §P1.4).
- Tôn trọng typography đã chuẩn hoá (SectionTitle bay bổng, PanelTitle 18px).

### 8.5. Gỡ Giai đoạn 2 trên toàn app (dữ liệu không tồn tại)
`diem`/`giai_thuong` còn xuất hiện nhiều nơi — nên ẩn đồng loạt (file `frontend/app/page.tsx`):
- **Spotlight** (~1770): bỏ metric "Điểm thi đua" (`diem`).
- **Card "Giai đoạn 2: điểm thưởng"** (~1799) và **awards "Sáng kiến tiêu biểu"** (~1650, 1810): bỏ.
- **Admin grid** cột "Điểm"/"Giải thưởng" (~1990, 2004-2005) + card mobile (~2031) + **export CSV** 2 cột này (~474, 484-485): bỏ.
- **Detail drawer** (~2594) & **InitiativeCard** (~2546): Pill `giaiThuong`: bỏ.
- Giữ cột DB (`diem`, `giai_thuong`) để dành Giai đoạn 2 — chỉ ẩn UI.

---

## 9. Trạng thái triển khai

**✅ Đã làm (đợt 1 — Design System):** §2 (component `PanelTitle`, `SectionTitle` bay bổng đồng bộ toàn app), Việt hoá tiêu đề, bỏ eyebrow hero, 3 ảnh minh hoạ vinh danh (SVG `honor-1/2/3`).

**✅ Đã làm (đợt 2 — theo yêu cầu Thi đua + toàn kế hoạch):**
- **§8 Thiết kế lại trang Thi đua**: bỏ bộ lọc thời gian (giả); thêm toggle chỉ số **Số sáng kiến / Lượt quan tâm**; podium Top 3 Ban/VP hiển thị cả 2 số; bảng xếp hạng đầy đủ Ban/VP (hạng 4+) + Cá nhân (dùng `departmentStats`, `leaderBoard` có `quanTam`); Top sáng kiến được quan tâm; bỏ khối trùng lặp.
- **§8.5 Gỡ Giai đoạn 2** (`diem`/`giai_thuong`) khỏi UI: spotlight, card "Giai đoạn 2", awards "Sáng kiến tiêu biểu", cột Điểm/Giải thưởng ở admin + export CSV (thay bằng Ngày nộp), Pill giải thưởng ở card/detail. Giữ cột DB.
- **P0.2 Empty/loading/chart-0**: `FieldFlowChart`/`DonutChart`/`WordCloud` có trạng thái rỗng (không vẽ khi 0); trang Thi đua có `LoadingState`/`EmptyState`/`EmptyHint`.
- **P0.3** banner lỗi đỏ → dải cảnh báo vàng nhẹ.
- **P1.6 Chatbot**: bong bóng bot có nền/viền, nền khung mist, panel đặc, **typing indicator**.
- **P1.4 (một phần) + control**: `Select` có chevron tùy biến (appearance-none).
- **P1.5 (một phần) Form**: input file tùy biến tiếng Việt (bỏ "Choose File" native); **panel success** sau khi gửi (nút Tải .docx + Về danh sách). Action bar vốn đã sticky.

**✅ Đã làm (đợt 3 — nốt phần còn lại):**
- **Form P1.5 hoàn tất**: stepper **bấm để nhảy section** (scroll-mt tránh bị nav che); nút **"Xem bản xem trước"** mở modal phiếu đăng ký dạng văn bản (Georgia) + nút Tải .docx; **giữ dữ liệu đồng tác giả** khi đổi Cá nhân↔Nhóm (stash trong `useInitiativeForm`); nhãn rõ **"Đơn vị/Phòng ban chủ trì"** vs **"Đơn vị công tác"**.
- **Ngày**: `<html lang="vi">` đã có; thêm hint **"(ngày/tháng/năm)"** cạnh nhãn. Lưu ý: widget date native theo locale máy (máy VN đã hiện dd/mm/yyyy); DOCX xuất ra đã dd/mm/yyyy qua `formatDateVN`.

**⏳ Còn lại (cần quyết định của bạn):**
- P1.4 nâng cao (tùy chọn): click chart → auto-scroll + highlight dòng bảng (hiện đã cross-filter + `tablePulse`).
- §6 **AI thật**: cần chốt provider + khoá API nội bộ + endpoint backend (không thể tự thêm khoá). Hiện là mock có typing indicator + luồng "Đưa vào form".

---

## 10. Câu hỏi mở

1. **Font bay bổng** giữ Georgia italic (đã chốt: giữ).
2. **Ảnh chân dung vinh danh**: đang dùng minh hoạ SVG tạm; có thay bằng ảnh thật không?
3. **Trang Thi đua**: có làm **lọc thời gian thật theo `ngay_nop`** (backend hỗ trợ query theo tháng/quý/năm) không, hay bỏ control thời gian?
4. Xếp hạng ưu tiên mặc định theo **Số sáng kiến** hay **Lượt quan tâm**?
5. Xác nhận **gỡ hẳn `diem`/`giai_thuong` khỏi UI** (giữ trong DB) — đồng ý chứ?
6. Nếu làm **AI thật**: provider nào, có khoá API nội bộ chưa?
