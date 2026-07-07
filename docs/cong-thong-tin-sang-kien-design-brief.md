# Cổng thông tin sáng kiến Công đoàn Công ty Mẹ - Design Brief & UX/UI Specification

Cập nhật: 2026-07-06

## 1. Mục tiêu sản phẩm

Tạo một nền tảng đơn giản, thân thiện và truyền cảm hứng để công đoàn viên Công ty Mẹ:

- Dễ dàng đóng góp ý tưởng, sáng kiến.
- Tìm cảm hứng sáng tạo thông qua AI.
- Xem phong trào thi đua nội bộ bằng dữ liệu trực quan.
- Lan tỏa các sáng kiến có giá trị.
- Hỗ trợ admin quản trị kho dữ liệu sáng kiến, người dùng và thị hiếu quan tâm.

Tinh thần giao diện cần thể hiện:

- Chuyển đổi số.
- Đổi mới sáng tạo khoa học công nghệ.
- Năng lượng xanh, phát triển bền vững.
- Tinh thần thi đua công đoàn.
- Hiện đại, sáng rõ, thân thiện, dễ sử dụng trên máy tính, tablet và điện thoại.

Điểm cần tránh:

- Không biến sản phẩm thành website giới thiệu năng lượng.
- Không làm landing page marketing đơn thuần.
- Không dùng giao diện quá corporate, khô và ít cảm hứng.
- Không để tính năng Phase 2 trông như đã hoàn thiện.

## 2. Đối tượng người dùng

### 2.1. Guest - người dùng không đăng nhập

Mục tiêu:

- Xem được bức tranh phong trào sáng kiến.
- Hiểu app có thể làm gì.
- Có động lực đăng nhập để tham gia.

Quyền truy cập:

- Xem `Trang chủ`.
- Xem thống kê cơ bản.
- Xem leaderboard công khai.
- Xem summary sáng kiến được quan tâm.
- Không mở chi tiết sáng kiến.
- Không tạo sáng kiến.
- Không dùng chatbot.
- Không truy cập dashboard chi tiết.
- Không truy cập admin.

Trạng thái UI:

- Các chức năng nâng cao có lock badge.
- Khi bấm vào chức năng bị khóa, mở login prompt hoặc bottom sheet trên mobile.

### 2.2. Employee - người dùng đăng nhập tài khoản Tập đoàn

Mục tiêu:

- Gửi sáng kiến nhanh.
- Xem và chỉnh sửa sáng kiến đã nhập.
- Xem chi tiết sáng kiến của người khác.
- Bấm quan tâm.
- Dùng chatbot để tìm cảm hứng.
- Xem dashboard chi tiết.

Quyền truy cập:

- Tất cả tab người dùng.
- Tạo, preview, xuất DOCX và gửi sáng kiến.
- Xem chi tiết sáng kiến.
- Dùng chatbot.
- Quan tâm sáng kiến.
- Xem `Sáng kiến của tôi`.

Trạng thái UI:

- Header hiển thị trạng thái đã đăng nhập.
- CTA chính là `Tạo sáng kiến`.
- Chatbot xuất hiện ở góc màn hình hoặc bottom sheet trên mobile.

### 2.3. Admin

Mục tiêu:

- Quản trị toàn bộ kho dữ liệu sáng kiến.
- Lọc, tra cứu, xuất báo cáo.
- Theo dõi người dùng và thị hiếu quan tâm.
- Chuẩn bị nền tảng cho Phase 2: chấm điểm, giải thưởng, token/coins.

Quyền truy cập:

- Toàn bộ quyền employee.
- Tab `Quản trị`.
- Grid sáng kiến đầy đủ.
- Bộ lọc admin.
- Export Excel/CSV.
- Quản trị người dùng và thị hiếu ở mức prototype.

Trạng thái UI:

- Admin tab chỉ hiện sau khi đăng nhập admin.
- Admin portal không nằm trong trải nghiệm guest public.

## 3. Kiến trúc thông tin đề xuất

### 3.1. Navigation chính

Public/Employee nav:

1. `Trang chủ`
2. `Sáng kiến`
3. `Thống kê`
4. `Thi đua`
5. `Hướng dẫn`

Admin nav:

6. `Quản trị`

Header CTA:

- Guest:
  - `Đăng ký sáng kiến` - outline.
  - `Đăng nhập tài khoản Tập đoàn` - green filled.
- Employee:
  - `Tạo sáng kiến`.
  - Tên/trạng thái tài khoản.
  - `Đăng xuất`.
- Admin:
  - Thêm `Quản trị`.
  - Badge/trạng thái `Quản trị viên`.

### 3.2. Access matrix

| Chức năng | Guest | Employee | Admin |
|---|---:|---:|---:|
| Xem Trang chủ | Có | Có | Có |
| Xem thống kê cơ bản | Có | Có | Có |
| Xem summary sáng kiến | Có | Có | Có |
| Xem chi tiết sáng kiến | Không | Có | Có |
| Bấm quan tâm | Không | Có | Có |
| Tạo sáng kiến | Không | Có | Có |
| Preview Word | Không | Có | Có |
| Xuất DOCX | Không | Có | Có |
| Chatbot AI | Không | Có | Có |
| Dashboard chi tiết | Không | Có | Có |
| Thi đua chi tiết | Hạn chế | Có | Có |
| Quản trị dữ liệu | Không | Không | Có |
| Export CSV/Excel | Không | Không | Có |

## 4. User journey chi tiết

### 4.1. Guest journey - xem phong trào và được dẫn tới đăng nhập

1. Guest vào `Trang chủ`.
2. Nhìn thấy hero banner: đổi mới sáng tạo, dữ liệu số, năng lượng xanh.
3. Đọc headline: `Cổng thông tin sáng kiến Công đoàn Công ty Mẹ`.
4. Nhìn thấy 3 action tile:
   - `Tạo sáng kiến`
   - `Hỏi AI`
   - `Xem chi tiết`
5. Mỗi action tile có lock badge: `Khóa đến khi đăng nhập`.
6. Guest cuộn xuống KPI band:
   - Sáng kiến mới cập nhật.
   - Lĩnh vực đổi mới trọng tâm.
   - Lượt quan tâm.
   - Ban/Văn phòng tham gia thi đua.
7. Guest xem thống kê cơ bản:
   - Top Ban/Văn phòng.
   - Top cá nhân.
   - Wordcloud lĩnh vực.
   - Donut chart tỷ lệ sáng kiến.
8. Guest bấm `Xem tất cả` hoặc bấm card sáng kiến.
9. Hệ thống mở login prompt:
   - Desktop: modal.
   - Mobile: bottom sheet.
10. Guest đăng nhập để tiếp tục hoặc đóng prompt.

UX intent:

- Guest vẫn nhận được giá trị.
- Các lock phải rõ nhưng không gây bực.
- CTA đăng nhập xuất hiện đúng lúc người dùng có nhu cầu.

### 4.2. Employee journey - bí ý tưởng, dùng AI, tạo sáng kiến

1. Employee đăng nhập tài khoản Tập đoàn.
2. Header chuyển trạng thái đã đăng nhập.
3. Employee bấm `Hỏi AI`.
4. Chatbot mở:
   - Desktop/tablet ngang: panel nổi góc phải.
   - Mobile: bottom sheet toàn chiều ngang.
5. Employee chọn prompt mẫu:
   - `Gợi ý cho tôi sáng kiến về tiết kiệm KHCN-ĐMST`.
   - `Ban Quản trị nguồn nhân lực thì nên làm sáng kiến gì?`
6. AI trả lời dựa trên dữ liệu sáng kiến đã cập nhật.
7. Employee bấm `Dùng gợi ý để tạo sáng kiến`.
8. App chuyển sang `Sáng kiến > Biểu mẫu đăng ký sáng kiến`.
9. Employee nhập form.
10. Employee bấm `Xem preview bản Word`.
11. Employee có thể bấm `Xuất File DOCX` trước khi gửi.
12. Employee bấm `Gửi Sáng Kiến`.
13. Hệ thống hiển thị trạng thái: `Đã gửi sáng kiến. Hồ sơ chuyển sang Chờ duyệt`.
14. Sáng kiến xuất hiện trong `Sáng kiến của tôi`.

UX intent:

- AI không chỉ là chat, mà là điểm khởi đầu để tạo sáng kiến.
- Từ AI đến form phải là một đường ngắn.
- DOCX export không bắt buộc phải đợi submit.

### 4.3. Employee journey - xem, quan tâm, chỉnh sửa sáng kiến

1. Employee vào tab `Sáng kiến` hoặc `Thống kê`.
2. Dùng filter:
   - Phòng ban.
   - Lĩnh vực.
   - Trạng thái.
   - Tìm kiếm.
3. Employee bấm một sáng kiến.
4. App mở detail modal/drawer.
5. Nội dung detail gồm:
   - Tên sáng kiến.
   - Lĩnh vực.
   - Tác giả/đồng tác giả.
   - Đơn vị.
   - Trạng thái.
   - Ngày nộp.
   - Lý do đề xuất.
   - Mục tiêu.
   - Thực trạng.
   - Giải pháp mới.
   - Cách thức áp dụng.
   - Hiệu quả dự kiến.
   - Tính mới.
   - Khả năng nhân rộng.
6. Employee bấm `Quan tâm sáng kiến này`.
7. Count quan tâm tăng và cập nhật leaderboard.
8. Nếu là sáng kiến của tôi, có nút `Chỉnh sửa sáng kiến`.

UX intent:

- Detail phải đủ thông tin như hồ sơ sáng kiến.
- Nút quan tâm là tín hiệu thi đua nhẹ, dễ dùng.
- Chỉnh sửa chỉ hiện khi phù hợp.

### 4.4. Admin journey - quản trị kho dữ liệu

1. Admin đăng nhập.
2. Header hiện tab `Quản trị`.
3. Admin vào `Quản trị`.
4. App hiển thị KPI admin:
   - Sáng kiến trong kho.
   - Đã duyệt.
   - Lượt quan tâm.
   - Tác giả.
5. Admin dùng filter:
   - Phòng ban.
   - Lĩnh vực.
   - Trạng thái.
6. Admin xem grid:
   - Tên sáng kiến.
   - Lĩnh vực.
   - Đơn vị.
   - Tác giả.
   - Trạng thái.
   - Quan tâm.
   - Điểm.
   - Giải thưởng.
7. Admin bấm `Export Excel/CSV`.
8. Admin theo dõi panel:
   - Quản trị người dùng.
   - Thị hiếu quan tâm.
   - Tag giải thưởng.

UX intent:

- Admin cần thấy dữ liệu nhanh, không cần hero.
- Table desktop phải đủ cột.
- Mobile/tablet chuyển thành card list có field chính.

## 5. Thiết kế từng tab

### 5.1. Trang chủ

Mục tiêu:

- Tạo cảm hứng.
- Cho thấy phong trào thi đua đang sống.
- Dẫn guest đến đăng nhập và employee đến hành động.

Các khu vực:

1. Header sticky.
2. Hero full-width:
   - Text overlay trái.
   - Background visual: dữ liệu số, turbine, solar, dashboard, lightbulb card.
   - 3 action tile.
3. KPI band.
4. Journey strip:
   - Guest xem phong trào.
   - Employee tìm cảm hứng với AI.
   - Đóng góp và lưu trữ.
5. Thống kê cơ bản:
   - Top Ban/Văn phòng.
   - Top cá nhân.
   - Wordcloud lĩnh vực.
   - Donut chart.
6. Sáng kiến được quan tâm.
7. Footer vinh danh:
   - Ảnh.
   - Quote ngắn.
   - Tên/đơn vị.
   - Số sáng kiến.

Đề xuất nâng cấp UI để ấn tượng hơn:

- Thêm lớp `data-flow` mảnh chạy ngang qua hero bằng CSS animation nhẹ.
- Trên hero, tạo 2-3 “floating data chips” nhỏ:
  - `AI gợi ý sáng kiến`.
  - `DOCX sẵn sàng`.
  - `891 lượt quan tâm`.
- KPI band nên có trạng thái hover liên kết với chart bên dưới.
- Wordcloud nên phản ứng khi hover/click: highlight sáng kiến cùng lĩnh vực.
- Footer vinh danh nên có ảnh chân dung thật hoặc ảnh minh họa nhất quán, không dùng thumbnail lĩnh vực lặp lại.

### 5.2. Sáng kiến

Mục tiêu:

- Là nơi employee tạo và quản lý sáng kiến.
- Guest chỉ xem summary.

Guest state:

- Auth gate rõ ràng.
- Danh sách summary public.
- Card có lock icon.
- CTA: `Đăng nhập để gửi sáng kiến`.

Employee state:

- Filter bar.
- Bảng/card sáng kiến.
- Sidebar `Sáng kiến của tôi`.
- Panel gợi ý AI.
- CTA `Tạo sáng kiến mới`.

Form:

- Section 1: `Thông tin chung`.
- Section 2: `Tác giả và đơn vị`.
- Section 3: `Nội dung sáng kiến`.
- Section 4: `Hiệu quả, tính mới, nhân rộng`.
- Sticky action bar:
  - `Hủy`.
  - `Về danh sách`.
  - `Xem preview bản Word`.
  - `Xuất File DOCX`.
  - `Gửi Sáng Kiến`.

Đề xuất nâng cấp UI:

- Thêm progress rail bên trái form trên desktop:
  - Thông tin chung.
  - Tác giả.
  - Nội dung.
  - Hiệu quả.
  - Hoàn tất.
- Trên mobile dùng stepper ngang compact.
- Textarea toolbar nên có icon thay vì chữ:
  - Bullet.
  - Numbered list.
  - Bold.
  - AI refine.
- Khi form dài, action bar sticky cần có shadow rõ hơn và không che nội dung cuối.
- Sau submit nên có success state riêng:
  - Mã hồ sơ.
  - Trạng thái.
  - Nút tải DOCX.
  - Nút xem sáng kiến của tôi.

### 5.3. Thống kê

Mục tiêu:

- Dashboard chi tiết cho employee/admin.
- Cho phép drill-down theo phòng ban, tác giả, lĩnh vực, quan tâm.

Khu vực:

1. Filter bar sticky.
2. KPI row:
   - Tổng sáng kiến.
   - Đã duyệt.
   - Chờ duyệt.
   - Lượt quan tâm.
   - Lĩnh vực nổi bật.
3. Chart panels:
   - Sáng kiến theo Ban/Văn phòng.
   - Lĩnh vực / wordcloud.
   - Mối quan tâm theo tác giả.
4. Table sáng kiến.

Đề xuất nâng cấp UI:

- Thêm “active filter summary” dạng chips:
  - `Ban KHCN`.
  - `Công nghệ`.
  - `Đã duyệt`.
- Chart panels nên có trạng thái selected rõ hơn.
- Khi click chart, table bên dưới scroll/highlight.
- Donut chart nên có legend tốt hơn trên mobile.
- Thêm chart `Mối quan tâm theo thời gian` ở Phase 1 nếu có dữ liệu ngày.
- Table desktop nên có sticky header nếu danh sách dài.

### 5.4. Thi đua

Mục tiêu:

- Tạo động lực phong trào.
- Là nơi hiển thị leaderboard và chuẩn bị gamification Phase 2.

Khu vực:

1. Intro ngắn.
2. Filter thời gian:
   - Tháng này.
   - Quý này.
   - Năm nay.
3. Top Ban/Văn phòng.
4. Top cá nhân.
5. Top sáng kiến được quan tâm.
6. Sáng kiến tiêu biểu.
7. Phase 2 preview:
   - Điểm thưởng.
   - Token/Coins.
   - Hội đồng đánh giá.

Đề xuất nâng cấp UI:

- Top 3 nên dùng medal treatment:
  - Gold.
  - Silver.
  - Bronze.
- Thêm “momentum indicator”:
  - Tăng/giảm so với kỳ trước.
- Sáng kiến tiêu biểu nên có card lớn hơn, không chỉ list đều nhau.
- Phase 2 phải dùng badge `Phase 2`, tone nhẹ, không giống tính năng đã hoạt động.

### 5.5. Hướng dẫn

Mục tiêu:

- Giúp công đoàn viên biết cách tham gia nhanh.

Khu vực:

1. Timeline 3 bước:
   - Tìm cảm hứng.
   - Tạo sáng kiến.
   - Xuất DOCX / Gửi duyệt.
2. FAQ.
3. Prompt mẫu AI.

Đề xuất nâng cấp UI:

- Timeline nên dùng visual line xanh-cyan nối các bước.
- FAQ dùng accordion rõ trạng thái mở/đóng.
- Prompt mẫu nên có nút `Copy prompt` hoặc `Hỏi AI ngay`.
- Mobile nên đưa prompt mẫu lên trước FAQ nếu mục tiêu là kích hoạt hành động.

### 5.6. Quản trị

Mục tiêu:

- Quản trị dữ liệu sáng kiến và xuất báo cáo.

Khu vực:

1. KPI admin.
2. Filter bar.
3. Grid/table.
4. Card list trên tablet/mobile.
5. Insight sidebar:
   - Quản trị người dùng.
   - Thị hiếu quan tâm.
   - Tag giải thưởng.

Đề xuất nâng cấp UI:

- Admin nên có layout ít cảm xúc hơn landing, nhưng vẫn theo token global.
- Filter admin nên hỗ trợ search theo tên/tác giả.
- Table nên có row action:
  - Xem.
  - Đổi trạng thái.
  - Gắn tag.
  - Export riêng.
- Mobile admin nên có filter drawer vì nhiều field.

## 6. Global design system

### 6.1. Màu sắc

Các token chính:

- `--green-600`: CTA chính, active, đăng nhập, tạo sáng kiến.
- `--green-500`: highlight, icon, progress.
- `--navy-900`: heading lớn, surface dữ liệu quan trọng.
- `--blue-700`: chart, line data, secondary action.
- `--cyan-500`: data flow, AI, digital signal.
- `--gold-500`: thi đua, giải thưởng, Phase 2.
- `--surface`: nền card.
- `--mist`: nền trang và panel nhẹ.
- `--line`: border.

Đề xuất:

- Giữ palette hiện tại.
- Tăng cyan như accent chuyển đổi số ở hero, chart connector, AI.
- Dùng gold tiết chế cho thi đua và giải thưởng.
- Không dùng quá nhiều dark navy block, chỉ dùng cho admin/table header/modal header.

### 6.2. Typography

Hiện tại:

- Heading lớn navy, weight cao.
- Body dễ đọc.

Đề xuất:

- Desktop hero: headline lớn, mạnh, không quá dài một dòng.
- Mobile hero: 34-38px là hợp lý, tránh chiếm hết màn hình.
- Card title: 15-18px.
- Data label: 12-13px.
- Không dùng letter spacing âm.

### 6.3. Components cần chuẩn hóa

Nên giữ hoặc tách thành component riêng:

- `AppShell`.
- `TopNav`.
- `MobileNav`.
- `PageHero`.
- `ActionTile`.
- `StatTile`.
- `ChartPanel`.
- `LeaderboardRow`.
- `InitiativeCard`.
- `DetailDrawer`.
- `FilterBar`.
- `AuthGatePanel`.
- `Chatbot`.
- `WordPreview`.
- `AdminGrid`.

Nguyên tắc:

- Card radius 8-12px.
- Không lồng card trong card nếu không cần.
- Button phải có icon nếu là công cụ.
- CTA chính luôn xanh.
- Data/chart dùng navy/blue/cyan.
- Thi đua/giải thưởng dùng gold.

## 7. Responsive design

### 7.1. Breakpoints

- Mobile: `< 640px`.
- Tablet: `640px - 1024px`.
- Laptop phổ thông: `1024px - 1440px`.
- Wide: `> 1440px`.

### 7.2. Desktop/laptop

Nguyên tắc:

- Max width nội dung: 1280px.
- Header sticky đầy đủ nav.
- Hero full-width, text overlay trái, visual nền.
- Chart grid 3-4 cột.
- Table dùng desktop layout.
- Chatbot floating góc phải.

Rủi ro hiện tại:

- Header có nhiều item, dễ chật ở 1280px.
- Cần giữ nav item `whitespace-nowrap`.
- Logo text không được wrap nhiều dòng.

### 7.3. Tablet

Nguyên tắc:

- Header có thể chuyển hamburger từ dưới 1280px nếu cần.
- Hero giữ hình nền nhưng nội dung gọn hơn.
- Chart grid 2 cột.
- Filter bar có thể full-width stacked.
- Table chuyển hybrid hoặc card.

Đề xuất:

- iPad ngang: vẫn dùng nav đầy đủ nếu đủ rộng.
- iPad dọc: dùng hamburger.
- Chatbot có thể là side panel rộng 420px hoặc bottom sheet.

### 7.4. Mobile

Nguyên tắc:

- Header 64px.
- Logo + hamburger.
- Hero phải để lộ KPI hoặc section tiếp theo trong first viewport.
- Action tile compact 3 ô ngang nếu vừa.
- Filter là `Bộ lọc`.
- Table chuyển card.
- Chatbot là bottom sheet.

Đề xuất:

- Mobile hero headline 34-38px.
- Card text dùng `line-clamp` để không tràn.
- Sticky action bar form cần có padding bottom an toàn.
- Admin card list phải ưu tiên field chính, không cố nhồi table.

## 8. Rà soát website hiện tại

Rà soát nhanh bản đang chạy tại `http://127.0.0.1:3000`:

Điểm đã tốt:

- Có hero banner đúng tinh thần xanh số.
- Header đã có các tab chính.
- Có journey strip.
- Có KPI band.
- Có chart/leaderboard/card sáng kiến.
- Guest gating đã rõ hơn.
- Chatbot đã có prompt mẫu và CTA tạo sáng kiến.
- Form đã có preview Word, export DOCX, submit.
- Mobile đã có hamburger và hero gọn hơn.

Điểm cần cải thiện để ấn tượng hơn:

1. Hero còn tĩnh.
   - Nên thêm data flow animation rất nhẹ.
   - Nên thêm floating chips để tăng cảm giác công nghệ.

2. Các chart chưa thật sự interactive với nhau.
   - Click chart nên cập nhật filter và show active state.
   - Active filter nên hiển thị bằng chips.

3. Card sáng kiến còn giống card danh sách thông thường.
   - Nên nhấn mạnh impact: `Tiết kiệm`, `An toàn`, `Quy trình`, `Môi trường`.
   - Có thể thêm mini metric ngay trên card.

4. Chatbot chưa đủ cảm giác “AI Assistant”.
   - Nên có trạng thái gợi ý theo ngữ cảnh tab hiện tại.
   - Nên có nút `Đưa vào form` cho từng gợi ý.

5. Thi đua chưa đủ hấp dẫn.
   - Nên làm Top 3 nổi bật hơn.
   - Dùng medal, rank movement, spotlight card.

6. Admin còn là grid cơ bản.
   - Cần thêm row action, drawer detail, bulk export.

7. Visual asset còn có thể đồng nhất hơn.
   - Thumbnail lĩnh vực nên cùng style với hero.
   - Footer vinh danh nên có portrait/ảnh người thật hoặc minh họa thống nhất.

## 9. Đề xuất UI chi tiết để nâng cấp bản hiện tại

### 9.1. Nâng cấp cấp độ 1 - nhanh, ít rủi ro

Mục tiêu:

- Làm trang trông có chủ đích hơn mà không đổi architecture.

Hạng mục:

1. Hero:
   - Thêm 3 floating chips.
   - Thêm subtle moving data-flow overlay.
   - Thêm small label: `AI • DOCX • Thi đua nội bộ`.

2. Landing:
   - Journey strip chuyển thành timeline ngang có đường nối.
   - KPI band hover state.
   - Section title có icon nhất quán.

3. Cards:
   - Initiative card thêm mini metric:
     - Lượt quan tâm.
     - Trạng thái.
     - Lĩnh vực.
   - Card hover nhấn vừa phải, không quá mạnh.

4. Mobile:
   - Chatbot bottom sheet.
   - Filter details đã có, cần polish icon/spacing.

### 9.2. Nâng cấp cấp độ 2 - tạo cảm giác sản phẩm hoàn chỉnh

Mục tiêu:

- Tăng tính tương tác và mạch workflow.

Hạng mục:

1. Cross-filter chart:
   - Click `Top Ban/Văn phòng` cập nhật filter.
   - Click `Lĩnh vực` cập nhật filter.
   - Table/list tự highlight kết quả.

2. Detail drawer:
   - Desktop dùng side drawer thay modal để giữ context dashboard.
   - Mobile dùng full-screen drawer.

3. AI idea assistant:
   - Chat trả lời kèm 2-3 suggestion cards.
   - Mỗi suggestion có nút:
     - `Đưa vào form`.
     - `Tìm sáng kiến tương tự`.

4. Form:
   - Thêm stepper.
   - Auto-save draft prototype.
   - Success screen sau submit.

5. Thi đua:
   - Top 3 podium.
   - Spotlight card cho sáng kiến tiêu biểu.

### 9.3. Nâng cấp cấp độ 3 - khác biệt và ấn tượng

Mục tiêu:

- Tạo dấu ấn thị giác riêng cho “Sáng kiến xanh số”.

Hạng mục:

1. Hero live scene:
   - Dòng dữ liệu xanh-cyan chạy rất nhẹ.
   - Các data nodes pulse.
   - Dashboard screen có chart glow.

2. Dashboard storytelling:
   - `Phong trào tuần này` như một narrative band.
   - Hiển thị: “Ban X đang dẫn đầu”, “Lĩnh vực Y tăng mạnh”.

3. Gamification preview:
   - Phase 2 không chỉ là list, mà là “future module preview” có lock/phase badge.

4. Visual identity:
   - Bộ thumbnail theo lĩnh vực vẽ cùng style.
   - Avatar/portrait vinh danh đồng nhất.
   - Icon set line weight nhất quán.

## 10. Implementation roadmap đề xuất

### Phase 1 - Hoàn thiện UX prototype

- Header đầy đủ và mobile menu.
- Guest gating rõ.
- Form đầy đủ và preview DOCX.
- Dashboard chi tiết.
- Admin grid và export.
- Chatbot prompt mẫu.

Trạng thái hiện tại: cơ bản đã có.

### Phase 2 - Nâng UI và interaction

- Interactive chart cross-filter.
- Detail drawer thay modal.
- AI suggestion cards.
- Form stepper.
- Mobile bottom sheet chatbot.
- Thi đua spotlight.

### Phase 3 - Gamification và phê duyệt

- Luồng phê duyệt/chấm điểm.
- Hội đồng đánh giá.
- Token/Coins.
- Tag giải thưởng.
- Sáng kiến tiêu biểu tháng.

## 11. Checklist thiết kế trước khi triển khai UI tiếp

Desktop:

- Header không wrap ở 1280px.
- Hero không che hết nội dung dưới.
- Chart/table scan được nhanh.
- Detail drawer không quá rộng.

Tablet:

- Nav chuyển hợp lý.
- Chart 2 cột.
- Form không quá dài một dòng.
- Filter dễ mở.

Mobile:

- Hero gọn.
- Action tile không tràn chữ.
- Filter là `Bộ lọc`.
- Table thành card.
- Chatbot bottom sheet.
- Sticky action form không che nội dung.

Accessibility:

- Button có focus state.
- Contrast CTA xanh đủ rõ.
- Text không nhỏ dưới 11px ở nội dung quan trọng.
- Icon không là tín hiệu duy nhất.

Content:

- Không dùng text hướng dẫn quá dài trong UI.
- Microcopy ngắn, hành động rõ.
- Phase 2 luôn có badge.

## 12. Kết luận thiết kế

Thiết kế nên giữ hướng “Sáng kiến xanh số”: nền sáng, xanh PVN, navy dữ liệu, cyan chuyển đổi số, gold thi đua. Trải nghiệm cần đưa người dùng đi từ cảm hứng đến hành động:

1. Thấy phong trào.
2. Tìm ý tưởng.
3. Tạo sáng kiến.
4. Xuất DOCX/gửi duyệt.
5. Theo dõi thi đua.
6. Admin quản trị và khai thác dữ liệu.

Bản hiện tại đã có nền tảng đúng. Các nâng cấp tiếp theo nên tập trung vào:

- Tăng chiều sâu hero và visual identity.
- Làm chart thật sự tương tác.
- Làm AI trở thành cầu nối sang form.
- Làm thi đua hấp dẫn hơn.
- Tinh chỉnh mobile/tablet như một trải nghiệm chính, không chỉ responsive phụ.
