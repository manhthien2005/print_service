# Print Service Frontend

Ứng dụng frontend hiện đại được xây dựng với Next.js 14, TypeScript và các best practices của React.

## 🚀 Bắt Đầu Nhanh

```bash
# Cài đặt dependencies
npm install

# Thiết lập biến môi trường
cp .env.example .env.local

# Chạy development server
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000)

## 🛠️ Công Nghệ

- **Framework**: Next.js 14+ (App Router)
- **Ngôn ngữ**: TypeScript (strict mode)
- **Styling**: TailwindCSS
- **State Management**: Zustand (client) + TanStack Query (server)
- **Forms**: React Hook Form + Zod
- **Đa ngôn ngữ**: next-intl (vi, en)
- **Code Quality**: ESLint, Prettier, SonarQube
- **CI/CD**: GitHub Actions → Heroku

## 📁 Cấu Trúc Dự Án

```
src/
├── app/[locale]/          # App Router với i18n
├── components/            # UI components
│   ├── ui/               # Base components
│   ├── layout/           # Layout components
│   └── common/           # Shared components
├── lib/                  # Utilities
│   ├── api/             # API client
│   ├── hooks/           # Custom hooks
│   ├── stores/          # Zustand stores
│   └── utils/           # Helper functions
└── locales/             # i18n translations
```

## 📜 Scripts Có Sẵn

| Lệnh                 | Mô tả                    |
| -------------------- | ------------------------ |
| `npm run dev`        | Chạy development server  |
| `npm run build`      | Build cho production     |
| `npm run start`      | Chạy production server   |
| `npm run lint`       | Chạy ESLint              |
| `npm run lint:fix`   | Sửa lỗi ESLint           |
| `npm run format`     | Format code với Prettier |
| `npm run type-check` | Kiểm tra TypeScript      |
| `npm run sonar`      | Chạy SonarQube analysis  |

---

Build with ❤️ by LGBBQ++ TEAM.
