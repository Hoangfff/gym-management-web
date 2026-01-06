# Copilot Instructions - gym-management-web

> AI Agent phải trả lời bằng **tiếng Việt** (trừ khi prompt bằng tiếng Anh).

## Tech Stack
- **React 19** + **TypeScript 5.9** (strict mode) + **Vite 7**
- ESLint 9 với `eslint-plugin-react-hooks` và `eslint-plugin-react-refresh`

## Commands
```bash
npm run dev      # Dev server với HMR
npm run build    # Type-check + production build
npm run lint     # ESLint check
```

## TypeScript Quan Trọng
- `verbatimModuleSyntax: true`  **BẮT BUỘC** dùng `import type` cho type-only imports
- `strict: true`, `noUnusedLocals`, `noUnusedParameters` enabled
- Target ES2022  có thể dùng `at()`, `Object.hasOwn()`

## Cấu Trúc Dự Án
```
src/
 assets/       # Static assets
 App.tsx       # Root component
 main.tsx      # Entry point với StrictMode
 *.css         # Stylesheets
```
> Mở rộng: tạo `components/`, `pages/`, `hooks/`, `services/`, `types/`, `utils/`

## Naming Conventions
| Loại | Convention | Ví dụ |
|------|------------|-------|
| Component files | PascalCase | `UserProfile.tsx` |
| Props types | `...Props` suffix | `type UserProfileProps` |
| Request/Response DTOs | `Req/Res` prefix | `ReqLoginDTO`, `ResUserDTO` |
| Variables/Functions | camelCase | `getUserById()` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |

## Component Pattern (ref: src/App.tsx)
```tsx
import { useState } from 'react'
import './ComponentName.css'

function ComponentName() {
  const [state, setState] = useState(initial)
  return (/* JSX */)
}

export default ComponentName
```

## Import Rules
- **Include `.tsx` extension**: `import App from './App.tsx'`
- Public assets: `/vite.svg` (absolute)
- Src assets: `./assets/react.svg` (relative)

## Quy Tắc Bắt Buộc
1. Functional components + hooks only (không class components)
2. Default exports cho components
3. Co-locate styles: `Component.tsx` + `Component.css`
4. Hỏi lại nếu requirements không rõ ràng

---
**Last Updated**: 2026-01-05
