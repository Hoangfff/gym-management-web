# Gym Management Web Application

Ứng dụng quản lý phòng gym hiện đại được xây dựng bằng **React 19**, **TypeScript**, và **Vite**. Hệ thống cung cấp giao diện quản lý toàn diện cho Admin và Personal Trainer (PT).

## ✨ Tính năng chính

### 🏋️ Quản lý Thành viên (Members)
- Danh sách thành viên active/inactive
- Tạo, chỉnh sửa, xóa thành viên
- Quản lý thông tin cá nhân và trạng thái

### 📋 Quản lý Hợp đồng (Contracts)
- Tạo hợp đồng cho thành viên với gói dịch vụ
- Tự động tính toán ngày kết thúc và số buổi tập
- Gán PT cho gói có PT included
- Chỉnh sửa và xóa hợp đồng
- Theo dõi sessions đã sử dụng

### 📅 Quản lý Booking
- Đặt lịch tập cho thành viên
- Check-in/Check-out
- Hủy booking với xác nhận
- Tìm kiếm và sắp xếp booking

### 🍎 Quản lý Dinh dưỡng (Diets)
- Food database với macros (protein, carbs, fat)
- Tạo daily diet plan cho thành viên
- Thêm/xóa thực phẩm vào diet plan
- Tính toán tổng calories và macros
- Phân trang cho diet plans

### 💪 Quản lý Bài tập (Workouts)
- Workout template database
- Tạo workout plan cho thành viên
- Thêm exercises vào workout plan
- Phân trang workout plans

### 📊 Dashboard & Reports
- Thống kê tổng quan (members, revenue, sessions)
- Biểu đồ doanh thu
- Top coaches
- Active members table

### 👤 Quản lý PT
- Danh sách Personal Trainers
- Quản lý lịch làm việc (PT Availability)
- Available time slots theo ngày trong tuần

### 📦 Quản lý khác
- Service Packages (gói dịch vụ)
- Additional Services (dịch vụ bổ sung)
- Inventory (kho)
- Time Slots (khung giờ)
- Payments (thanh toán)

## 🛠️ Tech Stack

- **Frontend Framework:** React 19
- **Language:** TypeScript 5.9 (strict mode)
- **Build Tool:** Vite 7
- **Routing:** React Router DOM 7
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Linting:** ESLint 9 với React Hooks plugin

## 📋 Yêu cầu hệ thống

- **Node.js:** 18.x hoặc cao hơn
- **npm:** 9.x hoặc cao hơn
- **Backend API:** Đảm bảo backend đã chạy tại `http://localhost:8080`

## 🚀 Hướng dẫn cài đặt và chạy

### 1. Clone repository

```bash
git clone <repository-url>
cd gym-management-web
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình API endpoint

Kiểm tra file `src/services/api.ts` và đảm bảo `baseURL` trỏ đúng backend:

```typescript
const api = axios.create({
  baseURL: 'http://localhost:8080'
});
```

### 4. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

### 5. Build production

```bash
npm run build
```

Output sẽ được tạo trong thư mục `dist/`

### 6. Preview production build

```bash
npm run preview
```

## 📁 Cấu trúc dự án

```
src/
├── assets/              # Static assets (images, fonts)
├── components/          # React components
│   ├── ui/             # Reusable UI components (Button, Input, Modal, etc.)
│   ├── dashboard/      # Dashboard-specific components
│   │   ├── sections/   # Dashboard sections (Members, Contracts, Diets, etc.)
│   │   ├── Modal/      # Modal wrapper component
│   │   ├── Sidebar/    # Navigation sidebar
│   │   └── ...
│   ├── Header/         # Landing page header
│   ├── Footer/         # Landing page footer
│   └── ...
├── hooks/              # Custom React hooks
├── pages/              # Page components (LandingPage, AdminPage, LoginPage, etc.)
├── services/           # API service layer
│   └── api.ts          # Axios configuration & API endpoints
├── styles/             # Global styles & CSS variables
├── types/              # TypeScript type definitions
│   └── api.ts          # API response/request types
├── utils/              # Utility functions & constants
├── App.tsx             # Root component với routing
└── main.tsx            # Entry point
```

## 🔐 Authentication Flow

1. User đăng nhập tại `/login`
2. Backend trả về `accessToken` và `role` (ADMIN/PT)
3. Token được lưu trong `localStorage`
4. Mỗi API request tự động gửi token qua header
5. Role-based routing: Admin → `/admin`, PT → `/pt`

## 🎨 Styling Convention

- CSS Modules pattern với BEM naming
- Global variables trong `src/styles/variables.css`
- Component-specific styles: `ComponentName.css` cạnh `ComponentName.tsx`

## 🔧 Scripts

| Command | Mô tả |
|---------|-------|
| `npm run dev` | Chạy dev server với HMR |
| `npm run build` | Type-check + build production |
| `npm run lint` | Chạy ESLint kiểm tra code |
| `npm run preview` | Preview production build |

## 📝 TypeScript Configuration

- **Strict Mode:** Enabled
- **verbatimModuleSyntax:** `true` - bắt buộc dùng `import type` cho type-only imports
- **Target:** ES2022
- **Unused variables/parameters:** Detected by compiler

## 🤝 Coding Guidelines

1. **Components:** Functional components với hooks only
2. **Exports:** Default export cho components
3. **File naming:** PascalCase cho components (`UserProfile.tsx`)
4. **Props types:** Suffix với `Props` (`type UserProfileProps`)
5. **DTOs:** Prefix `Req/Res` (`ReqLoginDTO`, `ResUserDTO`)
6. **Constants:** UPPER_SNAKE_CASE
7. **Import extensions:** Include `.tsx` extension

## 🐛 Troubleshooting

### Port đã được sử dụng
```bash
# Đổi port trong vite.config.ts hoặc:
npm run dev -- --port 3000
```

### Backend connection error
- Kiểm tra backend đã chạy tại port 8080
- Verify CORS đã được config cho `http://localhost:5173`

### Build errors
```bash
# Clear node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

Private project - All rights reserved

---

**Last Updated:** January 2026
