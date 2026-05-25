# Architecture Rules — DDD + Feature-based Architecture

> **PHẢI TUÂN THỦ** các quy tắc dưới đây trước khi viết bất kỳ dòng code nào.

---

## 1. Tổng quan kiến trúc

Project áp dụng **Domain-Driven Design (DDD)** kết hợp **Feature-based Architecture**.

```
src/
  domains/        ← Chứa các Bounded Context
  shared/         ← Tài nguyên dùng chung toàn app (UI, utils, constants)
  styles/         ← Global styles
  App.jsx
  main.jsx
```

---

## 2. Cấu trúc Bounded Context

Mỗi thư mục trong `domains/` là một **Bounded Context (BC)** độc lập.

```
domains/
  system/         ← BC: Quản lý hệ thống
  qms/            ← BC: Quản lý chất lượng
  kiosk/            ← BC: Quản lý kioks tra cứu thông tin
```

### Quy tắc BC

| Rule      | Mô tả                                                                            |
| --------- | -------------------------------------------------------------------------------- |
| **BC-01** | Mỗi BC là một thư mục ngang cấp trong `domains/`                                 |
| **BC-02** | Mỗi BC **phải có** `index.js` — đây là Public API duy nhất của BC                |
| **BC-03** | BC khác chỉ được import qua `index.js`, **không được** import thẳng vào internal |
| **BC-04** | BC không được import lẫn nhau theo vòng tròn (circular dependency)               |

---

## 3. Cấu trúc Feature

Mỗi BC chứa nhiều **Feature** trong thư mục `features/`.

```
domains/
  system/
    features/
      branch/
        components/     ← UI components của feature
        hooks/          ← Custom hooks (useBranch, useBranchForm...)
        pages/          ← Page components (chỉ dùng nội bộ feature)
        services/       ← API calls
        store/          ← State management (Redux slice / Zustand store)
        constants/      ← Constants riêng của feature
        utils/          ← Helper functions riêng của feature
        index.js        ← Public API của feature ⭐
      area/
        ...
        index.js
    index.js            ← Public API của BC (aggregate từ features) ⭐
```

### Quy tắc Feature

| Rule      | Mô tả                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------- |
| **FT-01** | Mỗi feature **phải có** `index.js` kiểm soát những gì được export ra ngoài                              |
| **FT-02** | `pages/` là **internal** — không bao giờ export ra ngoài feature                                        |
| **FT-03** | `store/` là **internal** — không bao giờ export ra ngoài feature                                        |
| **FT-04** | `utils/` nếu đủ chung thì đưa lên `shared/utils/`, không để trùng lặp                                   |
| **FT-05** | Mỗi file trong feature chỉ được import từ cùng feature hoặc từ `shared/` hoặc từ Public API của BC khác |

---

## 4. Public API — `index.js`

### Feature `index.js` — export những gì

```js
// domains/system/features/branch/index.js

// ✅ Export service functions
export {
  getBranches,
  getBranchById,
  createBranch,
} from "./services/branchService";

// ✅ Export hooks dùng chung
export { useBranch, useBranchList } from "./hooks/useBranch";

// ✅ Export components dùng chung (không phải page)
export { BranchSelect, BranchTag } from "./components";

// ✅ Export constants cần thiết
export { BRANCH_STATUS, BRANCH_TYPE } from "./constants";

// ❌ KHÔNG export pages
// export { BranchPage } from './pages/BranchPage'

// ❌ KHÔNG export store internal
// export { branchSlice } from './store/branchStore'
```

### BC `index.js` — aggregate từ features

```js
// domains/system/index.js

export {
  getBranches,
  getBranchById,
  BranchSelect,
  BRANCH_STATUS,
} from "./features/branch";
export { getAreas, AreaSelect } from "./features/area";
export { getUsers, useUser } from "./features/user";
export { getOrganizations } from "./features/organization";
```

---

## 5. Quy tắc Import

### ✅ ĐÚNG

```js
// Trong cùng feature — import thẳng
import { getBranches } from "../services/branchService";

// Từ shared — import qua alias
import { TableShared } from "@shared/components";

// Từ BC khác — chỉ qua Public API của BC
import { getBranches } from "@domains/system";
```

### ❌ SAI

```js
// Import thẳng vào internal của BC khác
import { getBranches } from "@domains/system/features/branch/services/branchService";

// Import thẳng vào internal của feature khác trong cùng BC
import { getBranches } from "../branch/services/branchService";
// → Phải đi qua: import { getBranches } from '@domains/system'

// Duplicate API call — viết lại API đã có ở BC khác
export const getBranches = () => api.get("/branches"); // ❌ nếu đã có ở system BC
```

---

## 6. Quy tắc Service

| Rule      | Mô tả                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| **SV-01** | Mỗi service file chỉ chứa API calls liên quan đến **một entity**                                           |
| **SV-02** | Nếu trang A cần gọi API của entity B → import service của B, **không viết lại**                            |
| **SV-03** | API endpoint gắn với context của feature (vd: `/areas/:id/branches`) thì được phép đặt trong `areaService` |
| **SV-04** | Không duplicate API call ở nhiều nơi                                                                       |

```js
// ✅ Đúng — endpoint thuộc context của area
// areaService.js
export const getBranchesByArea = (areaId) =>
  api.get(`/areas/${areaId}/branches`);

// ✅ Đúng — cần branch độc lập thì import branchService
import { getBranches } from "@domains/system";
```

---

## 7. Cấu trúc `shared/`

`shared/` chỉ chứa những thứ **không thuộc về bất kỳ BC nào**.

```
shared/
  components/       ← UI components thuần, không có business logic
    ModalShared.jsx
    SelectShared.jsx
    TableShared.jsx
  hooks/            ← Generic hooks (useDebounce, usePagination...)
  utils/            ← Helper functions (formatDate, formatCurrency...)
  constants/        ← App-wide constants (ROUTES, STATUS_CODES...)
  types/            ← TypeScript interfaces dùng chung (nếu dùng TS)
```

### Quy tắc Shared

| Rule      | Mô tả                                                                                       |
| --------- | ------------------------------------------------------------------------------------------- |
| **SH-01** | `shared/` **không được** import từ `domains/`                                               |
| **SH-02** | `shared/components/` **không được** chứa business logic                                     |
| **SH-03** | Nếu một util chỉ dùng trong 1 feature → đặt trong `feature/utils/`, không đưa lên `shared/` |
| **SH-04** | Nếu một component dùng ở nhiều BC → đưa vào `shared/components/`                            |

---

## 8. Quy tắc Routes

```
domains/
  system/
    features/
      branch/
        routes.jsx    ← Routes của branch feature
      area/
        routes.jsx
    routes.jsx        ← Aggregate routes từ tất cả features trong BC
  index.js
```

```js
// system/routes.jsx — chỉ compose, không định nghĩa route trực tiếp
import branchRoutes from "./features/branch/routes";
import areaRoutes from "./features/area/routes";

export default [...branchRoutes, ...areaRoutes];
```

---

## 9. Alias Configuration

Cấu hình alias trong `vite.config.js` để enforce import rules:

```js
// vite.config.js
export default defineConfig({
  resolve: {
    alias: {
      "@domains/system": "/src/domains/system/index.js",
      "@domains/qms": "/src/domains/qms/index.js",
      "@shared": "/src/shared",
    },
  },
});
```

---

## 10. ESLint Rules — Enforce tự động

```js
// .eslintrc.js
rules: {
  'no-restricted-imports': ['error', {
    patterns: [
      {
        group: ['@domains/system/features/*'],
        message: '❌ Không được import thẳng vào internal. Chỉ dùng: @domains/system'
      },
      {
        group: ['@domains/qms/features/*'],
        message: '❌ Không được import thẳng vào internal. Chỉ dùng: @domains/qms'
      },
      {
        group: ['../*/services/*', '../*/hooks/*', '../*/store/*'],
        message: '❌ Không được import thẳng vào internal của feature khác. Dùng Public API.'
      }
    ]
  }]
}
```

---

## 11. Checklist trước khi tạo file mới

Trả lời các câu hỏi sau trước khi tạo bất kỳ file nào:

```
[ ] File này thuộc về BC nào? (system / qms / shared)
[ ] File này thuộc về feature nào?
[ ] File này là internal hay public?
    → Nếu public: đã thêm export vào feature/index.js chưa?
    → Nếu public và BC khác cần dùng: đã thêm vào BC/index.js chưa?
[ ] File này có duplicate logic đã tồn tại ở nơi khác không?
[ ] Import trong file này có đi đúng chiều không? (không import ngược BC)
```

---

## 12. Tóm tắt — Sơ đồ luồng import

```
                    ┌─────────────────┐
                    │     shared/     │  ← Không import từ domains
                    └────────┬────────┘
                             │ import
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │   system/   │  │    qms/     │  │    kiosk/     │
    │  index.js   │  │  index.js   │  │  index.js   │
    └──────┬──────┘  └──────┬──────┘  └─────────────┘
           │                │
           │  import qua    │  import qua
           │  Public API    │  Public API
           ▼                ▼
    ┌─────────────┐  ┌─────────────┐
    │  features/  │  │  features/  │
    │  branch/    │  │   xxx/      │
    │  index.js   │  │  index.js   │
    └──────┬──────┘  └─────────────┘
           │
    ┌──────┴──────┐
    │  services/  │
    │  hooks/     │  ← Internal, không ai import thẳng vào đây
    │  store/     │
    └─────────────┘
```

---

> **Nguyên tắc vàng:** Mỗi `index.js` là một **cái cổng** — bạn kiểm soát ai được vào, ai không.  
> Import thẳng vào internal = **vi phạm kiến trúc**, sẽ bị ESLint báo lỗi.
