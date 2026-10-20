# ỨNG DỤNG QUẢN LÝ KHÓA HỌC (COURSE MANAGEMENT APP)
### KIẾN TRÚC: REACT NATIVE + REPOSITORY PATTERN + REACTIVE STATE MANAGEMENT
> **Môn học**: Lập trình Mobile App  
> **Backend**: MockAPI.io (REST API)  
> **Kiến trúc**: Repository Pattern (Data Abstraction Layer) + Reactive State (Auto-sync Store)  
> 📱 **Link Video Demo Ứng Dụng**: [Xem Video Demo Ứng Dụng tại đây (Google Drive)](https://drive.google.com/drive/folders/1SFw1H0RWHddSQwBlSv3uNzV1WlyDaHcR?usp=sharing)  
> 🎥 **Link Video Thuyết Minh Đồ Án**: [Xem Video Thuyết Minh tại đây (Google Drive)](https://drive.google.com/drive/folders/1bu8cnYV_3Z2_vJOmvvcFa5fkF-xXfsZ0?usp=sharing)  
> 🌐 **MockAPI Endpoint**: `https://6ad59cb148476c0785d98e46.mockapi.io/api/v1`

---

## 1. GIẢI THÍCH KIẾN TRÚC "REACTIVE & REPO" (REPOSITORY PATTERN)

Dự án được tái cấu trúc hoàn chỉnh theo chuẩn kiến trúc chuyên nghiệp:

```
[UI Screens / Components]
        ▲
        │  (Reactive Subscriptions & Actions)
        ▼
[Reactive State Store / Context (AppContext)]
        ▲
        │  (Calls Repository methods: getAll, create, update, delete, canDelete)
        ▼
[Repository Layer (CourseRepository, CategoryRepository)]
        ▲
        │  (Validations, Local In-memory Caching, Business Constraints)
        ▼
[HTTP Client (ApiClient)]
        ▲
        │  (REST API calls: GET, POST, PUT, DELETE with Timeout)
        ▼
[MockAPI.io Remote Backend]
```

### 1. Lớp Repository Pattern (`src/repositories/`):
- **`CourseRepository.js`**:
  - Đóng gói toàn bộ logic truy xuất và xử lý dữ liệu Khóa học (`getAll`, `getById`, `create`, `update`, `delete`).
  - Tích hợp hàm kiểm tra dữ liệu đầu vào `validate(courseData)`: học phí không âm, thời lượng > 0, các trường bắt buộc.
  - Tích hợp logic tìm kiếm và lọc dữ liệu `filterAndSearch(courses, query, categoryId)`.
- **`CategoryRepository.js`**:
  - Đóng gói toàn bộ logic truy xuất Danh mục (`getAll`, `getById`, `create`, `update`, `delete`).
  - **Ràng buộc khóa ngoại quan trọng**: Phương thức `canDelete(categoryId, courses)` kiểm tra danh mục có thể xóa hay không, ngăn chặn xóa danh mục đang có khóa học liên kết.
- **`ApiClient.js`**: Lớp bao đóng HTTP request (GET, POST, PUT, DELETE) với AbortController timeout và xử lý lỗi mạng tập trung.

### 2. Lớp Reactive State (`src/context/AppContext.js`):
- Sử dụng mô hình phản ứng (**Reactive State**): Khi bất kỳ hành động nào (Thêm, Sửa, Xóa) hoàn tất thông qua Repository, toàn bộ dữ liệu trên toàn bộ ứng dụng tự động đồng bộ và re-render ngay lập tức mà không cần reload màn hình thủ công.

---

## 2. HƯỚNG DẪN KHỞI TẠO GIT REPOSITORY (NỘP REPO)

Nếu bạn cần nộp bằng đường dẫn Git Repository (GitHub, GitLab), hãy chạy các lệnh sau:

```bash
# 1. Khởi tạo Git repo cục bộ
git init

# 2. Thêm tất cả file mã nguồn vào staging
git add .

# 3. Tạo commit đầu tiên
git commit -m "feat: Hoan thanh Course Management App voi Reactive va Repository Pattern"

# 4. Đổi nhánh chính thành main
git branch -M main

# 5. Liên kết tới remote repo trên GitHub/GitLab của bạn (thay bằng URL repo của bạn):
# git remote add origin https://github.com/USERNAME/course-management-app.git

# 6. Đẩy mã nguồn lên repo
# git push -u origin main
```

*(Dự án đã có sẵn file `.gitignore` loại trừ `node_modules`, `.expo`,... đảm bảo repo luôn sạch sẽ).*

---

## 3. CẤU TRÚC THƯ MỤC DỰ ÁN

```
Assighments 5/
├── .gitignore                     # Cấu hình bỏ qua file rác cho Git Repo
├── App.js                         # Cài đặt Navigation Stack bọc bởi AppProvider (Reactive)
├── index.js                       # Điểm khởi chạy của Expo
├── app.json                       # Cấu hình dự án Expo
├── package.json                   # Danh sách thư viện phụ thuộc
├── mockapi_data_setup.json        # Dữ liệu JSON mẫu (4 categories, 10 courses) để copy vào MockAPI
├── web-demo.html                  # File mô phỏng ứng dụng di động chạy ngay trên trình duyệt
├── README.md                      # Hướng dẫn chi tiết & kịch bản quay video thuyết trình
└── src/
    ├── constants/
    │   ├── config.js              # Cấu hình BASE_URL của MockAPI.io
    │   └── theme.js               # Bảng màu, typography và đổ bóng chuẩn UI
    ├── data/
    │   └── mockData.json          # Dữ liệu dự phòng in-memory khi offline
    ├── services/
    │   ├── apiClient.js           # HTTP Client chuẩn dùng trong Repository Pattern
    │   └── api.js                 # Helper format tiền tệ và tiện ích
    ├── repositories/              # <<< LỚP REPOSITORY PATTERN
    │   ├── CourseRepository.js    # Data Access Layer & Business Logic cho Courses
    │   └── CategoryRepository.js  # Data Access Layer & Ràng buộc toàn vẹn cho Categories
    ├── context/                   # <<< LỚP REACTIVE STATE MANAGEMENT
    │   └── AppContext.js          # Reactive Store & Custom Hooks useApp()
    ├── components/
    │   ├── CourseCard.js          # Thẻ hiển thị từng khóa học
    │   ├── CategoryFilter.js      # Thanh lọc danh mục trượt ngang
    │   └── StateViews.js          # View Loading, Empty và Lỗi kết nối
    └── screens/
        ├── CourseListScreen.js    # Màn hình (1): Danh sách khóa học, tìm kiếm & lọc
        ├── CourseDetailScreen.js  # Màn hình (2): Chi tiết khóa học, nút xem video & xóa
        ├── CourseFormScreen.js    # Màn hình (3): Form Thêm / Sửa khóa học kèm preview ảnh
        ├── CategoryManageScreen.js# Màn hình (4): Quản lý danh mục & kiểm tra ràng buộc xóa
        └── TrailerPlayerScreen.js # Màn hình (5): Trình phát video trailer trực tiếp
```

---

## 4. HƯỚNG DẪN THIẾT LẬP MOCKAPI.IO

### Bước 1: Tạo Project trên MockAPI
1. Truy cập [https://mockapi.io/](https://mockapi.io/) và đăng nhập (Google hoặc GitHub).
2. Nhấn nút **"New Project"**.
3. Điền tên: `CourseManagement` và API prefix mặc định là `api/v1` -> Nhấn **Create**.

### Bước 2: Tạo 2 Resources (`categories` & `courses`)
1. **Resource 1**: Nhấn **"New Resource"**:
   - Tên resource: `categories` -> Nhấn **Create**.
   - Nhấn vào nút **Data** của resource `categories`, xóa dữ liệu mặc định và dán toàn bộ mảng trong mục `"categories"` của file [`mockapi_data_setup.json`](./mockapi_data_setup.json) vào -> Nhấn **Update**.

2. **Resource 2**: Nhấn **"New Resource"**:
   - Tên resource: `courses` -> Nhấn **Create**.
   - Nhấn vào nút **Data** của resource `courses`, xóa dữ liệu mặc định và dán toàn bộ mảng trong mục `"courses"` của file [`mockapi_data_setup.json`](./mockapi_data_setup.json) vào -> Nhấn **Update**.

### Bước 3: Cấu hình URL vào ứng dụng
Copy Base URL từ project MockAPI của bạn (dạng: `https://YOUR_ID.mockapi.io/api/v1`) và dán vào:
- File [`src/constants/config.js`](./src/constants/config.js):
  ```javascript
  export const API_CONFIG = {
    BASE_URL: 'https://6ad59cb148476c0785d98e46.mockapi.io/api/v1',
    TIMEOUT: 4000,
    ENABLE_LOCAL_FALLBACK: true,
  };
  ```

---

## 5. HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### Cách 1: Chạy thử ngay trên trình duyệt với `web-demo.html`
- Mở trực tiếp file [`web-demo.html`](./web-demo.html) bằng Chrome / Edge.
- Trải nghiệm mô phỏng toàn diện trên chiếc iPhone ảo với đầy đủ 5 màn hình.

---

### Cách 2: Chạy ứng dụng React Native với Expo
1. Mở Terminal / PowerShell tại thư mục này:
   ```bash
   npm install
   ```
2. Khởi động Expo:
   ```bash
   npx expo start
   ```
3. Xem trên các thiết bị:
   - **Điện thoại Android / iOS**: Cài ứng dụng **Expo Go** và quét mã QR trên terminal.
   - **Trình duyệt Web**: Bấm phím `w` trong terminal.

---

## 6. KỊCH BẢN THUYẾT TRÌNH VIDEO ĐẠT ĐIỂM TỐI ĐA

1. **Phần 1: Giới thiệu (1 phút)**:
   - Giới thiệu bản thân và đề tài "Quản lý khóa học".
   - Nhấn mạnh kiến trúc sử dụng: **React Native kết hợp Repository Pattern và Reactive State Management**.
   - Trình bày cấu trúc MockAPI.io với 2 resource `/categories` và `/courses`.

2. **Phần 2: Màn hình Danh sách khóa học (Course List) (1.5 phút)**:
   - Giải thích luồng dữ liệu: UI gọi `useApp()` -> Lấy dữ liệu qua `CourseRepository` và `CategoryRepository`.
   - Trình diễn: Tìm kiếm theo tên (Reactive search), Lọc theo danh mục, Kéo xuống làm mới.

3. **Phần 3: Màn hình Chi tiết khóa học & Video Trailer (1.5 phút)**:
   - Bấm vào khóa học xem chi tiết đầy đủ thông tin và category name map động.
   - Bấm **"Xem Video Trailer"** chứng minh video `.mp4` được phát mượt mà trực tiếp trong app.

4. **Phần 4: Thêm & Sửa khóa học (2 phút)**:
   - Bấm `+` mở form: Danh mục nạp động từ `categories`, Live preview ảnh bìa.
   - Trình diễn validation: Bỏ trống hoặc nhập học phí âm sẽ bị chặn.
   - Nhập đầy đủ, bấm Lưu -> Reactive Store tự động cập nhật khóa học lên đầu danh sách ngay lập tức.

5. **Phần 5: Quản lý danh mục & Ràng buộc toàn vẹn (2 phút)**:
   - Mở màn hình Quản lý danh mục.
   - Thử bấm Xóa danh mục đang có khóa học -> Bị chặn với cảnh báo vi phạm ràng buộc toàn vẹn (chứng minh logic trong `CategoryRepository.canDelete`).
   - Thêm danh mục mới, chỉnh sửa và xóa danh mục rỗng thành công.

---

> 📱 **Link Video Demo Ứng Dụng Thực Tế**: [Mở Video Demo trên Google Drive](https://drive.google.com/drive/folders/1SFw1H0RWHddSQwBlSv3uNzV1WlyDaHcR?usp=sharing)  
> 🎬 **Link Video Thuyết Minh Đồ Án**: [Mở Video Thuyết Minh trên Google Drive](https://drive.google.com/drive/folders/1bu8cnYV_3Z2_vJOmvvcFa5fkF-xXfsZ0?usp=sharing)
