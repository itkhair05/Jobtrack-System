# JobTrack

[![CI](https://github.com/itkhair05/Jobtrack-System/actions/workflows/ci.yml/badge.svg)](https://github.com/itkhair05/Jobtrack-System/actions/workflows/ci.yml)

Công cụ theo dõi quá trình ứng tuyển việc làm full-stack, hỗ trợ quản lý toàn bộ vòng đời ứng tuyển từ giai đoạn lưu trữ hồ sơ đến khi nhận việc.

![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.1-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

JobTrack cung cấp hệ thống quản lý tập trung cho người tìm việc: theo dõi đơn tuyển dụng qua giao diện bảng kanban và danh sách, lưu trữ lịch sử chuyển trạng thái kèm mốc thời gian, nhắc nhở lịch follow-up, quản lý thư viện CV phiên bản hóa, và tổng hợp báo cáo qua biểu đồ thống kê trực quan.

## Demo

- **Live URL:** https://jobtrack-bld.pages.dev
- **Backend API:** https://jobtrack-backend-kgn3.onrender.com
- **Health check:** https://jobtrack-backend-kgn3.onrender.com/actuator/health

### Lưu ý khi trải nghiệm

- Backend dùng Aiven MySQL free tier — request đầu tiên có thể chậm 30–60 giây nếu database đang idle (cold start).
- Backend dùng Render Starter plan với Persistent Disk cho CV storage.
- Đăng ký tài khoản mới để trải nghiệm đầy đủ tính năng.

## Tính năng

### Pipeline ứng tuyển
- Ghi nhận thông tin đơn ứng tuyển: công ty, vị trí, mức lương, đường dẫn tin tuyển dụng, ngày nộp hồ sơ, ngày hẹn follow-up, ghi chú và CV đính kèm.
- Quản lý trạng thái theo 5 giai đoạn chuẩn: Đã lưu (SAVED), Đã ứng tuyển (APPLIED), Phỏng vấn (INTERVIEWING), Nhận offer (OFFERED), Bị từ chối (REJECTED).
- Chuyển đổi linh hoạt giữa giao diện bảng Kanban kéo-thả trực quan và giao diện danh sách có phân trang, lọc theo trạng thái và tìm kiếm từ khóa.
- Lưu trữ toàn bộ lịch sử thay đổi trạng thái kèm thời gian và ghi chú chi tiết cho từng đơn.

### Nhắc follow-up
- Thiết lập ngày hẹn liên hệ lại cho từng đơn ứng tuyển.
- Trung tâm nhắc nhở (Reminder Center) tại Dashboard tự động phân loại và làm nổi bật các đơn đã quá hạn hoặc đến hạn trong vòng 7 ngày.

### Thư viện CV
- Tải lên các định dạng PDF và DOCX với dung lượng tối đa 10 MB.
- Kiểm tra tính hợp lệ qua 3 lớp: phần mở rộng tên file, MIME type khai báo trong request, và magic bytes nhận diện nội dung thực tế bằng Apache Tika nhằm ngăn chặn file ngụy trang độc hại.
- Đổi tên hiển thị, tải xuống trực tiếp và liên kết phiên bản CV tương ứng vào từng hồ sơ ứng tuyển.

### Thống kê & xuất dữ liệu
- Bảng điều khiển phân tích tổng hợp: tổng số đơn, tỷ lệ phân bổ theo trạng thái (biểu đồ tròn) và số lượng hồ sơ nộp theo từng tháng (biểu đồ cột).
- Xuất danh sách dữ liệu ứng tuyển sang định dạng CSV hoặc bảng tính Excel (XLSX).

### Tài khoản & bảo mật
- Xác thực stateless bằng mã thông báo JWT (thuật toán HMAC-SHA), mật khẩu băm với BCrypt.
- Hệ thống đa người dùng công khai: mỗi tài khoản được cô lập dữ liệu tuyệt đối theo mã định danh người dùng.
- Giới hạn tần suất yêu cầu (Rate Limiting) theo địa chỉ IP: tối đa 10 lượt/phút đối với các endpoint xác thực và 20 lượt/phút đối với thao tác tải lên CV.
- Tự động thu hồi phiên đăng nhập phía frontend khi nhận mã phản hồi 401 hoặc 403 từ máy chủ.

## Công nghệ sử dụng

| Tầng | Công nghệ |
| :--- | :--- |
| **Backend** | Java 17, Spring Boot 4.1.1 (Web MVC, Security, Data JPA, Validation, Actuator), Flyway, MySQL Connector/J, jjwt 0.12.6, Apache POI 5.4.1 (XLSX), Apache Tika 2.9.2, Lombok |
| **Frontend** | React 19.2.8, TypeScript 6.0, Vite 8.3, React Router 7.18, Tailwind CSS 4.3, React Hook Form 7.89, Zod 4.6, Axios 1.20, Recharts 3.10, Lucide React |
| **Kiểm thử** | JUnit 5, Mockito, AssertJ (backend test suite); ESLint 10, TypeScript Compiler (`tsc -b`) (frontend) |
| **Hạ tầng** | Docker (multi-stage build), Docker Compose (MySQL 8.4 + Backend), Render (Docker Web Service + Persistent Disk), Cloudflare Pages (Vite SPA + `_redirects`), Aiven for MySQL (kết nối TLS) |

## Kiến trúc Production

Ứng dụng được triển khai trên nền tảng đám mây phân tán nhằm tối ưu chi phí và độ tin cậy:

```
[ Trình duyệt Client ]
        │
        ├───> [ Cloudflare Pages ] : Phục vụ React SPA tĩnh (Vite build) + SPA Routing
        │
        └───> [ Render Web Service ] : API Spring Boot chạy trên Docker container
                    │
                    ├───> [ Render Persistent Disk ] : Lưu trữ file CV tải lên (/var/lib/jobtrack/uploads/cvs)
                    │
                    └───> [ Aiven for MySQL ] : Cơ sở dữ liệu quan hệ (kết nối mã hóa qua TLS/SSL)
```

- **Frontend:** Triển khai trên Cloudflare Pages dưới dạng ứng dụng đơn trang (SPA). Sử dụng tệp `frontend/public/_redirects` với cấu hình rewrite `/* /index.html 200` để hỗ trợ điều hướng route phía client.
- **Backend:** Triển khai trên Render Web Service dưới dạng Docker container đóng gói từ mã nguồn. Cung cấp API RESTful và endpoint kiểm tra tình trạng ứng dụng tại `/actuator/health`.
- **Database:** Dịch vụ MySQL đám mây do Aiven cung cấp, thực thi giao thức TLS bắt buộc (`sslMode=REQUIRED`). Quản lý cấu trúc bảng và cập nhật tự động qua Flyway migrations.
- **Lưu trữ CV:** Render Persistent Disk được gắn kết vào thư mục `/var/lib/jobtrack/uploads/cvs` của container, đảm bảo file CV không bị mất khi container khởi động lại hoặc deploy phiên bản mới.

## Cấu trúc dự án

```
jobtrack-system
├── backend/                      # Ứng dụng Spring Boot REST API
│   ├── src/main/java/com/jobtrack/backend/
│   │   ├── controller/           # REST controllers và GlobalExceptionHandler
│   │   ├── dto/                  # DTO request và response records
│   │   ├── entity/               # JPA entities và enums (ApplicationStatus)
│   │   ├── repository/           # Spring Data JPA repositories
│   │   ├── security/             # JWT filter, rate limit filter và SecurityConfig
│   │   └── service/              # Logic xử lý nghiệp vụ
│   ├── src/main/resources/
│   │   ├── db/migration/         # Flyway migrations (V1__init_schema, V2__add_application_follow_up_date)
│   │   └── application*.properties
│   └── Dockerfile                # Multi-stage Docker build cho production
├── frontend/                     # Ứng dụng React SPA
│   ├── public/
│   │   └── _redirects            # Quy tắc rewrite cho Cloudflare Pages SPA routing
│   ├── src/
│   │   ├── components/           # Components tái sử dụng (Kanban, Modal, Toast, ReminderCenter)
│   │   ├── context/              # Quản lý trạng thái xác thực (AuthContext)
│   │   ├── layouts/              # MainLayout (Sidebar và Header)
│   │   ├── pages/                # Các màn hình chính (Dashboard, Applications, Analytics, CVs, Settings)
│   │   └── services/             # Axios API client có định kiểu
│   ├── package.json
│   └── vite.config.ts
├── design-system/                # Hướng dẫn thiết kế giao diện
├── docker-compose.yml            # Khởi chạy cục bộ toàn bộ hệ thống (MySQL + Backend)
├── .env.example                  # Mẫu các biến môi trường
└── README.md
```

## Bắt đầu (Local Development)

### Yêu cầu môi trường

- Java Development Kit (JDK) 17 trở lên
- Node.js phiên bản 20 trở lên
- Máy chủ MySQL 8.0 trở lên (hoặc Docker để chạy container MySQL)

### 1. Chạy Backend (profile dev)

Di chuyển vào thư mục backend và khởi chạy thông qua Maven Wrapper:

```bash
cd backend
./mvnw spring-boot:run
```

Trên hệ điều hành Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

- Máy chủ API hoạt động tại `http://localhost:8080`.
- Profile `dev` được kích hoạt mặc định. Hệ thống tự động tạo cơ sở dữ liệu `jobtrack_db` (nếu chưa tồn tại) và Flyway thực hiện các tệp migration.
- Cấu hình dev cho phép kết nối CORS từ `http://localhost:*` và `http://127.0.0.1:*`.

### 2. Chạy Frontend

Mở một cửa sổ dòng lệnh khác, cài đặt các phụ thuộc và khởi động máy chủ phát triển Vite:

```bash
cd frontend
npm install
npm run dev
```

- Giao diện truy cập tại `http://localhost:5173`.
- Theo mặc định, frontend gửi yêu cầu API đến `http://localhost:8080/api/v1`. Có thể cấu hình địa chỉ khác qua biến `VITE_API_URL` trong tệp `frontend/.env`.

### 3. Khởi chạy bằng Docker Compose

Để chạy toàn bộ hệ thống (gồm cơ sở dữ liệu MySQL và Backend) mà không cần cài đặt Java hay MySQL cục bộ:

```bash
cp .env.example .env
docker compose up --build
```

- Tệp `.env` cần được điền các giá trị cho `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD` và `JWT_SECRET`.
- Docker Compose sẽ khởi tạo container MySQL 8.4, chờ đến khi quá trình kiểm tra sức khỏe (health check) đạt trạng thái healthy, sau đó mới bắt đầu tiến trình chạy backend.
- File CV được lưu vào Docker volume `jobtrack_cv_uploads`, dữ liệu MySQL được lưu vào volume `jobtrack_mysql_data`.

## Triển khai Production

### 1. Chuẩn bị cơ sở dữ liệu Aiven for MySQL

1. Đăng ký tài khoản và tạo một dự án MySQL trên [Aiven](https://aiven.io/).
2. Thu thập các thông tin kết nối: Host, Port, Database, User và Password.
3. Tạo chuỗi kết nối JDBC URL có chỉ định chế độ mã hóa TLS:
   ```text
   jdbc:mysql://<AIVEN_HOST>:<AIVEN_PORT>/<AIVEN_DB>?sslMode=REQUIRED&serverTimezone=UTC
   ```

### 2. Triển khai Backend lên Render

1. Tạo một **Web Service** mới trên Render và liên kết với kho lưu trữ GitHub của dự án.
2. Thiết lập thông số cơ bản:
   - **Environment:** `Docker`
   - **Root Directory:** *(để trống hoặc đặt `backend` tùy theo cấu trúc workspace)*
   - **Dockerfile Path:** `./backend/Dockerfile`
   - **Docker Context:** `./backend`
   - **Health Check Path:** `/actuator/health`
3. Thiết lập các biến môi trường (**Environment Variables**):
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `DB_URL`: `jdbc:mysql://<AIVEN_HOST>:<AIVEN_PORT>/<AIVEN_DB>?sslMode=REQUIRED&serverTimezone=UTC`
   - `DB_USERNAME`: `<AIVEN_USER>`
   - `DB_PASSWORD`: `<AIVEN_PASSWORD>`
   - `JWT_SECRET`: `<chuoi-ngau-nhien-it-nhat-32-ky-tu>`
   - `CORS_ALLOWED_ORIGINS`: `https://jobtrack-bld.pages.dev`
   - `UPLOAD_DIRECTORY`: `/var/lib/jobtrack/uploads/cvs`
4. Cấu hình lưu trữ tệp (**Persistent Disk**):
   - Thêm một Persistent Disk vào dịch vụ và mount vào thư mục: `/var/lib/jobtrack/uploads/cvs`.

### 3. Triển khai Frontend lên Cloudflare Pages

1. Tạo dự án mới trên Cloudflare Pages và kết nối với kho lưu trữ GitHub.
2. Cấu hình quy trình Build:
   - **Framework preset:** `Vite`
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Cấu hình biến môi trường Build:
   - `VITE_API_URL`: `https://jobtrack-backend-kgn3.onrender.com/api/v1`
4. Tệp `frontend/public/_redirects` sẽ được tự động sao chép vào thư mục `dist` trong quá trình build để kích hoạt cơ chế chuyển tiếp SPA routing.

### 4. Cập nhật CORS và kiểm tra sau triển khai

1. Sau khi Cloudflare Pages hoàn tất việc cấp phát domain, cập nhật biến `CORS_ALLOWED_ORIGINS` trên Render đúng với domain đã được cấp.
2. Kiểm tra trạng thái hoạt động:
   - Truy cập `https://jobtrack-backend-kgn3.onrender.com/actuator/health` để xác nhận trạng thái `{"status":"UP"}`.
   - Truy cập giao diện tại `https://jobtrack-bld.pages.dev`, tiến hành đăng ký tài khoản mới, tạo đơn ứng tuyển và tải lên thử một tệp CV.

## Cấu hình (Environment Variables)

| Biến | Mô tả | Mặc định khi dev |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Profile runtime của Spring Boot (`dev` hoặc `prod`) | `dev` |
| `DB_URL` | Đường dẫn kết nối JDBC đến cơ sở dữ liệu MySQL | `jdbc:mysql://localhost:3306/jobtrack_db?...` |
| `DB_USERNAME` | Tên đăng nhập cơ sở dữ liệu | `root` |
| `DB_PASSWORD` | Mật khẩu cơ sở dữ liệu | *(để trống)* |
| `MYSQL_ROOT_PASSWORD` | Mật khẩu tài khoản root của MySQL (chỉ dùng cho Docker Compose) | *(bắt buộc trong .env)* |
| `MYSQL_PORT` | Cổng ánh xạ MySQL trên máy host (chỉ dùng cho Docker Compose) | `3306` |
| `PORT` | Cổng dịch vụ HTTP của backend | `8080` |
| `JWT_SECRET` | Khóa bí mật dùng để ký chữ ký số HMAC-SHA (tối thiểu 32 ký tự) | Khóa mặc định cho môi trường dev (bắt buộc cấu hình ở `prod`) |
| `JWT_EXPIRATION_MS` | Thời hạn hiệu lực của mã thông báo JWT tính bằng mili-giây | `86400000` (24 giờ ở dev; prod mặc định `3600000` = 1 giờ) |
| `CORS_ALLOWED_ORIGINS` | Danh sách các origin được phép gọi API, phân tách bằng dấu phẩy | `http://localhost:*,http://127.0.0.1:*` |
| `UPLOAD_DIRECTORY` | Thư mục lưu trữ các tệp CV trên ổ cứng máy chủ | `uploads/cvs` (prod mặc định `/var/lib/jobtrack/uploads/cvs`) |
| `JPA_SHOW_SQL` | Hiển thị log các câu truy vấn SQL thực thi | `true` (prod mặc định `false`) |
| `JPA_FORMAT_SQL` | Định dạng các dòng log truy vấn SQL | `true` (prod mặc định `false`) |
| `VITE_API_URL` | Đường dẫn gốc của API mà giao diện frontend sẽ gọi đến | `http://localhost:8080/api/v1` |

## Tổng quan API

Đường dẫn gốc: `/api/v1`. Mọi endpoint ngoại trừ nhóm `/auth/**` và các endpoint giám sát Actuator đều yêu cầu header `Authorization: Bearer <token>`.

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Đăng ký tài khoản người dùng mới và nhận token xác thực |
| `POST` | `/api/v1/auth/login` | Đăng nhập với email cùng mật khẩu và nhận token xác thực |
| `GET` | `/api/v1/users/me` | Lấy thông tin tài khoản của người dùng hiện tại |
| `PUT` | `/api/v1/users/profile` | Cập nhật họ tên, email hoặc mật khẩu (yêu cầu mật khẩu hiện tại) |
| `GET` | `/api/v1/applications` | Lấy danh sách đơn ứng tuyển có phân trang (`page`, `size`), lọc theo `status`, tìm kiếm `search` |
| `POST` | `/api/v1/applications` | Tạo mới một đơn ứng tuyển |
| `GET` | `/api/v1/applications/{id}` | Lấy chi tiết thông tin đơn ứng tuyển kèm toàn bộ lịch sử trạng thái |
| `PUT` | `/api/v1/applications/{id}` | Cập nhật thông tin chi tiết của đơn ứng tuyển |
| `PATCH` | `/api/v1/applications/{id}/status` | Đổi trạng thái đơn ứng tuyển và ghi nhận mốc lịch sử mới |
| `DELETE` | `/api/v1/applications/{id}` | Xóa bỏ một đơn ứng tuyển |
| `GET` | `/api/v1/applications/follow-ups` | Lấy danh sách các đơn có lịch hẹn liên hệ trong khoảng thời gian (`days`, mặc định 7 ngày) |
| `GET` | `/api/v1/applications/analytics` | Lấy báo cáo thống kê: tổng số đơn, phân bổ theo trạng thái, số đơn theo tháng |
| `GET` | `/api/v1/applications/export` | Xuất dữ liệu danh sách đơn ra định dạng CSV hoặc bảng tính Excel (`?format=csv\|xlsx`) |
| `POST` | `/api/v1/cvs/upload` | Tải lên tệp CV (multipart/form-data, định dạng PDF/DOCX, dung lượng tối đa 10 MB) |
| `GET` | `/api/v1/cvs` | Lấy danh sách các tệp CV đã tải lên của người dùng |
| `GET` | `/api/v1/cvs/{id}/download` | Tải xuống nội dung tệp CV (kèm header `X-Content-Type-Options: nosniff`) |
| `DELETE` | `/api/v1/cvs/{id}` | Xóa tệp CV khỏi hệ thống và gỡ liên kết khỏi các đơn ứng tuyển |
| `GET` | `/actuator/health` | Kiểm tra tình trạng hoạt động của ứng dụng (public endpoint) |
| `GET` | `/actuator/info` | Xem thông tin cấu hình ứng dụng (public endpoint) |

## Kiểm thử

### Kiểm thử Backend

Chạy bộ kiểm thử tự động của backend qua Maven:

```bash
cd backend
./mvnw test
```

Trên hệ điều hành Windows:

```powershell
cd backend
.\mvnw.cmd test
```

Bộ kiểm thử gồm 8 bài kiểm tra:
- Unit test với JUnit 5, Mockito và AssertJ nhằm xác minh tính chính xác của nghiệp vụ ghi lịch sử trạng thái đơn ứng tuyển, kiểm tra giới hạn ngày follow-up và quy tắc cập nhật hồ sơ cá nhân.
- Integration test kiểm tra khả năng khởi động ngữ cảnh của Spring Boot (`BackendApplicationTests`).

### Kiểm tra Frontend

Kiểm tra cú pháp, quy tắc mã nguồn và thực hiện build đóng gói:

```bash
cd frontend
npm run lint      # Chạy ESLint kiểm tra lỗi mã nguồn và quy tắc React Hooks
npm run build     # Biên dịch TypeScript (tsc -b) và đóng gói production với Vite
```

## Ghi chú bảo mật

- **Xác thực phi trạng thái (Stateless Authentication):** Sử dụng JSON Web Token với thuật toán ký HMAC-SHA. Mọi yêu cầu được thẩm định độc lập qua `JwtAuthenticationFilter`, không duy trì session trên bộ nhớ máy chủ.
- **Mã hóa mật khẩu:** Mật khẩu người dùng được băm một chiều bằng giải thuật BCrypt thông qua Spring Security `BCryptPasswordEncoder`.
- **Cô lập dữ liệu người dùng:** Mọi thao tác truy vấn và chỉnh sửa dữ liệu đơn ứng tuyển và CV đều bắt buộc lọc qua khóa ngoại `user_id` của tài khoản đang xác thực, ngăn chặn hoàn toàn lỗ hổng IDOR.
- **Giới hạn tần suất (Rate Limiting):** Lớp lọc `RateLimitFilter` giám sát tần suất theo IP trên bộ nhớ: giới hạn 10 yêu cầu/phút cho các endpoint đăng nhập/đăng ký nhằm hạn chế brute-force, và 20 yêu cầu/phút cho endpoint upload file.
- **Xác thực tệp tải lên 3 lớp:**
  1. Kiểm tra phần mở rộng tên file (chỉ chấp nhận `.pdf` và `.docx`).
  2. Phân tích magic bytes của tệp qua Apache Tika để định danh chính xác định dạng nhị phân, ngăn chặn các file thực thi ngụy trang.
  3. Kiểm tra declared MIME type từ header HTTP request.
- **Chống Path Traversal và MIME Sniffing:** Tệp CV được lưu với tên ngẫu nhiên kết hợp mã UUID, kiểm tra chuỗi đường dẫn với thư mục đích, và phản hồi tải tệp luôn gắn kèm header `X-Content-Type-Options: nosniff`.
- **Nguyên tắc Fail-Fast ở môi trường Production:** Cấu hình `application-prod.properties` không cung cấp fallback giá trị cho các biến nhạy cảm; ứng dụng sẽ từ chối khởi động nếu thiếu `JWT_SECRET`, `DB_URL`, `DB_USERNAME` hoặc `DB_PASSWORD`.
- **Bảo vệ thông tin lỗi:** Lớp `GlobalExceptionHandler` kiểm soát toàn diện phản hồi lỗi; các chi tiết kỹ thuật nhạy cảm và stack trace chỉ ghi vào log nội bộ của máy chủ, không hiển thị trong phản hồi gửi về client.

## Tác giả

Được xây dựng bởi [Dương Thế Khải](https://github.com/itkhair05).
