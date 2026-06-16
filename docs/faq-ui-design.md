# FAQ Module — Thiết kế Giao diện

## 1. Tổng quan

Module FAQ quản lý **Question Flow** dạng cây quyết định.
Gồm các màn hình:

| Màn hình | Route | Mô tả |
|----------|-------|-------|
| Danh sách Flow | `/faq` | Bảng danh sách tất cả flows |
| Tạo Flow | `/faq/create` | Builder tạo flow mới |
| Sửa/Xem Flow | `/faq/:id` | Builder xem và chỉnh sửa flow (chung 1 action) |

---

## 2. Màn hình Danh sách Flow (`FlowList`)

### Bố cục

```
┌──────────────────────────────────────────────────────────────┐
│  [Search...]                               [+ Thêm mới]      │
├──────┬───────────┬──────────┬───────┬───────────┬────────────┤
│  #   │ Tên flow  | Chi nhánh| Số Q  | Ngày tạo  | Thao tác   │
├──────┼───────────┼──────────┼───────┼───────────┼────────────┤
│  1   │ Hỗ trợ KH │ CN Hà Nội│   3   │ 15/06/2026│ [Edit][Del]│
│  2   │ Xử lý KN  │ CN SG    │   5   │ 14/06/2026│ [Edit][Del]│
└──────┴───────────┴──────────┴───────┴───────────┴────────────┘
                                    [1] [2] [3] ... [10]
```

### Chi tiết

- **Search:** Tìm theo tên flow (debounced, như pattern `useTable`)
- **Data table:** `TableShared` với các cột:
  - `name` — Hiển thị dạng link (click -> vào builder ở mode view/edit)
  - `branch` — Tên chi nhánh (lazy loaded qua `useGetBranchesQuery`)
  - `questionCount` — Số lượng câu hỏi trong flow
  - `createdAt` / `updatedAt` — Format `toVNTime`
  - **Actions:** `EditButton` (vào builder), `DeleteButton` — shared components
- **Nút [+ Thêm mới]:** `Button` với icon từ `react-icons` (vd: `IoAddOutline` hoặc `MdOutlineAdd`) -> navigate `/faq/create`

### API

- `GET /api/question-flows?offset=0&limit=10&search=name&keyword=...`
  - Response: `{ data: [...], meta: { totalItems, totalPages } }`
  - Backend: dùng `BaseService` findAll với search theo `name`

---

## 3. Màn hình Flow Builder (`FlowBuilder`)

### 3.1 Bố cục tổng thể

```
┌──────────────────────────────────────────────────────────────┐
│  <- Quay lại danh sách      [Lưu] [Lưu & Đóng]               │
├──────────────────────────────────────────────────────────────┤
│  +---------------------------------------------------------+ │
│  | THONG TIN CO BAN                                        | │
│  | Ten flow:    [________________________]                  | │
│  | Mo ta:       [________________________]                  | │
│  | Chi nhanh:   [Dropdown chon chi nhanh Downarrow]         | │
│  +---------------------------------------------------------+ │
│                                                               │
│  +--------- CAY CAU HOI ------------------------------------+ │
│  |                                                           | │
│  |  +-- Q1: "Ban can ho tro gi?" -- [?] [Edit] [Del] ------+ | │
│  |  |  Loai: question . Terminal: [Toggle]                  | | │
│  |  |                                                       | | │
│  |  |  Lua chon:                                            | | │
│  |  |  +- [Ky thuat] ----> Q2: "Mo ta loi?"          [+O]  | | │
│  |  |  +- [Khieu nai] ----> Q3: "So dien thoai?"           | | │
│  |  +-------------------------------------------------------+ | │
│  |                                                           | | │
│  |  +-- Q2: "Mo ta loi ban gap?" -- [?] [Edit] [Del] ------+ | │
│  |  |  Loai: question . Terminal: [On]                      | | │
│  |  |  Answer: "Bo phan ky thuat se lien he..."            | | │
│  |  +-------------------------------------------------------+ | │
│  |                                                           | | │
│  |  [+ Them cau hoi]                                         | | │
│  +-----------------------------------------------------------+ |
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Thong tin co ban

- **Ten flow:** `Input` required
- **Mo ta:** `Input.TextArea` optional
- **Chi nhanh:** `SelectShared` voi `useGetBranchesQuery`

### 3.3 Cay cau hoi -- moi Question Node

Moi question la mot card voi:

| Vung | Component | Ghi chu |
|------|-----------|---------|
| **Header** | Title + action buttons | Icon info (`IoInformationCircleOutline`), `EditButton`, `DeleteButton` |
| **Node type** | `Select` | `question`, `sub_question`, `info_screen` |
| **isTerminal** | `Switch` | Bat/tat terminal |
| **Options list** | Danh sach option | Moi option = label + next question selector |
| **Answer** | `Input.TextArea` | Chi hien thi khi `isTerminal = true` |

**Quy tac icon/button:**
- Icon hien thi thong tin (`IoInformationCircleOutline`) tu `react-icons/io5`
- Nut action xai component shared: `EditButton` (tu `@shared/components/EditButton`), `DeleteButton` (tu `@shared/components/DeleteButton`)
- Nut xoa option trong danh sach cung xai `DeleteButton`
- Nut "Them lua chon" (+O) dung `MdOutlineAddCircleOutline` tu `react-icons/md`
- Nut "Them cau hoi" dung `IoAddOutline` tu `react-icons/io5`

#### 3.3.1 Options cua mot Question

```
├─ [Label: ______________] [next question Downarrow] [DeleteButton]
├─ [Label: ______________] [next question Downarrow] [DeleteButton]
└─ [+ Them lua chon]
```

- **Label:** `Input` -- noi dung option
- **Next Question:** `Select` -- dropdown chon tu cac question khac trong flow (tru chinh no va children cua no de tranh cycle). Label: `Q{orderIndex}: {title}`
- **Delete:** `DeleteButton` xoa option do

#### 3.3.2 Answer (chi khi isTerminal = true)

```
Answer:
[________________________________________________________]
[________________________________________________________]
```

`Input.TextArea` khong gioi han do dai.

### 3.4 Them cau hoi moi

Nut **"[+ Them cau hoi]"** o cuoi tree mo Modal:

```
+-- THEM CAU HOI --------------------------------------------+
|                                                             |
|  Cau hoi cha: [Dropdown chon question cha Downarrow]        |
|               (Bo trong = root question)                    |
|                                                             |
|  Tieu de:    [________________________________]            |
|  Mo ta:      [________________________________]            |
|  Loai node:  [question Downarrow]                          |
|  Terminal:   [ Toggle ]                                    |
|                                                             |
|  +-------------------------------------------------------+ |
|  |                  [Huy]     [Them]                     | |
|  +-------------------------------------------------------+ |
+-------------------------------------------------------------+
```

Sau khi them, question moi xuat hien o dung vi tri trong tree.

### 3.5 Add Option

Nut **"[+ Them lua chon]"** ben trong card question -> them ngay 1 option moi vao danh sach (inline), voi label rong va next question null.

### 3.6 Nut luu

- **Luu:** Goi API POST (tao moi) hoac PUT (cap nhat), o lai trang
- **Luu & Dong:** Goi API, navigate ve danh sach
- Co loading state tren nut trong khi luu
- Icon cac nut luu dung `react-icons` (vd: `MdOutlineSave`, `IoCheckmarkOutline`)

### 3.7 Validation phia Frontend

| Rule | Message |
|------|---------|
| Flow phai co it nhat 1 root question | "Vui long them it nhat mot cau hoi goc" |
| Question non-terminal phai co >=1 option | "Cau hoi khong phai terminal can co it nhat mot lua chon" |
| Question terminal khong duoc co option co nextRef | "Cau hoi terminal khong duoc co lua chon tro den cau hoi khac" |
| Parent phai dung truoc child trong mang | Warning khi xay dung cay |
| Ten flow khong duoc de trong | "Vui long nhap ten flow" |

### 3.8 Xu ly du lieu -- chuyen doi cay <-> flat array

**Tu UI tree -> API request:**

```js
function flattenTree(questions) {
  let index = 0;
  const result = [];

  function walk(node, parentRef) {
    const ref = `q${++index}`;
    result.push({
      ref,
      title: node.title,
      nodeType: node.nodeType,
      isTerminal: node.isTerminal,
      parentRef,
      orderIndex: node.orderIndex,
      options: node.options.map((opt) => ({
        label: opt.label,
        nextRef: opt.nextQuestion?.tempRef || null,
        orderIndex: opt.orderIndex,
      })),
      answer: node.isTerminal ? { content: node.answer } : undefined,
    });

    node.options.forEach((opt) => {
      if (opt.nextQuestion) walk(opt.nextQuestion, ref);
    });
  }

  questions.forEach((q) => walk(q, null));
  return result;
}
```

**Tu API response -> UI tree:**

```js
function buildTree(questions) {
  const map = {};
  questions.forEach((q) => {
    map[q.ref] = { ...q, children: [] };
  });

  const roots = [];
  questions.forEach((q) => {
    if (!q.parentRef) {
      roots.push(map[q.ref]);
    }
  });

  roots.forEach(attachNextQuestions);

  return roots;

  function attachNextQuestions(node) {
    node.options = node.options.map((opt) => ({
      ...opt,
      nextQuestion: opt.nextRef ? map[opt.nextRef] : null,
    }));
    node.options.forEach((opt) => {
      if (opt.nextQuestion) attachNextQuestions(opt.nextQuestion);
    });
  }
}
```

---

## 4. Component Tree

```
components/
├── FlowInfoSection.jsx       -- Ten, mo ta, chi nhanh
├── QuestionNode.jsx          -- Mot question card (recursive)
│   +-- QuestionHeader.jsx    -- Title + action buttons (EditButton, DeleteButton)
│   +-- OptionList.jsx        -- Danh sach options
│   |   +-- OptionItem.jsx    -- Label + next question Select + DeleteButton
│   +-- AnswerEditor.jsx      -- TextArea cho answer
+-- AddQuestionModal.jsx      -- Modal them cau hoi moi
```

### Icon & Component convention

| Element | Icon (react-icons) | Component |
|---------|-------------------|-----------|
| Nut xem thong tin question | `IoInformationCircleOutline` (io5) | Inline icon button |
| Nut sua question | — | `EditButton` (`@shared/components/EditButton`) |
| Nut xoa question / option | — | `DeleteButton` (`@shared/components/DeleteButton`) |
| Nut Them moi flow | `IoAddOutline` (io5) | Ant `Button` |
| Nut Them cau hoi | `IoAddOutline` (io5) | Ant `Button` |
| Nut Them lua chon (+O) | `MdOutlineAddCircleOutline` (md) | Ant `Button` |
| Nut Luu | `MdOutlineSave` (md) | Ant `Button` |
| Nut Quay lai | `IoArrowBackOutline` (io5) | Ant `Button` |

---

## 5. RTK Query Service

```js
import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

export const questionFlowService = createApi({
  reducerPath: "questionFlowService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["QuestionFlow"],
  endpoints: (builder) => ({
    getQuestionFlows: builder.query({
      query: (args) => ({
        url: "/question-flows",
        method: "GET",
        params: buildParams(args),
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: "QuestionFlow", id: "LIST" },
              ...result.data.map((r) => ({ type: "QuestionFlow", id: r.id })),
            ]
          : [{ type: "QuestionFlow", id: "LIST" }],
    }),

    getQuestionFlowById: builder.query({
      query: (id) => ({ url: `/question-flows/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "QuestionFlow", id }],
    }),

    createQuestionFlow: builder.mutation({
      query: (body) => ({ url: "/question-flows", method: "POST", data: body }),
      invalidatesTags: [{ type: "QuestionFlow", id: "LIST" }],
    }),

    updateQuestionFlow: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/question-flows/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "QuestionFlow", id: "LIST" },
        { type: "QuestionFlow", id },
      ],
    }),

    deleteQuestionFlow: builder.mutation({
      query: (id) => ({ url: `/question-flows/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "QuestionFlow", id: "LIST" }],
    }),
  }),
});

export const {
  useGetQuestionFlowsQuery,
  useGetQuestionFlowByIdQuery,
  useCreateQuestionFlowMutation,
  useUpdateQuestionFlowMutation,
  useDeleteQuestionFlowMutation,
} = questionFlowService;
```

---

## 6. Cau truc thu muc de xuat

```
src/domains/faq/
+-- index.js                              # Export: routes, navigation, services
+-- routes.jsx                            # Route definitions (list, create, edit)
+-- navigation.jsx                        # Sidebar item
+-- features/
    +-- question-flows/
        +-- index.js                      # Export services, hooks, components
        +-- services/
        |   +-- questionFlowService.js    # RTK Query
        +-- hooks/
        |   +-- useFlowTree.js            # Tree <-> flat conversion utils
        +-- components/
        |   +-- FlowInfoSection.jsx
        |   +-- QuestionNode.jsx
        |   +-- OptionItem.jsx
        |   +-- AnswerEditor.jsx
        |   +-- AddQuestionModal.jsx
        +-- pages/
            +-- FlowListPage.jsx
            +-- FlowBuilderPage.jsx
```

> **Luu y:** Domain `faq` hien tai khong tuan theo cau truc `features/` (pages nam o domain root). Neu chuyen sang `features/question-flows/`, can cap nhat `routes.jsx` va `index.js` tuong ung.

---

## 7. Luong dieu huong

```
/faq
  +-- (index) -> FlowListPage
  +-- create  -> FlowBuilderPage (mode=create)
  +-- :id     -> FlowBuilderPage (mode=edit -- vua xem vua sua)
```

### Path constants can them

```js
FAQ: {
  BASE: "faq",
  CREATE: "create",
  DETAIL: ":id",
}
```

---

## 8. Ghi chu ky thuat

- `FlowBuilder` dung chung cho ca create va edit -- phan biet qua `useParams()` co `:id` hay khong
- Su dung `useModal` va `useTable` pattern nhu cac feature khac trong du an
- Branch selector dung `SelectShared` voi `useGetBranchesQuery` tu `@domains/system`
- Delete flow dung `DeleteButton` da co
- Can them path constants `FAQ.CREATE`, `FAQ.DETAIL` vao `systemConstants.js`
- Dang ky `questionFlowService` trong `allRTKServices.js`
- Build tree tu flat array: API GET tra ve flat `questions[]`, can buildTree de hien thi UI dang cay
- Flatten tree khi submit: nguoc lai, tu cay UI -> flat array voi `ref` system
- Icon dung `react-icons`: `IoAddOutline`, `IoArrowBackOutline`, `IoInformationCircleOutline` tu `react-icons/io5`; `MdOutlineAddCircleOutline`, `MdOutlineSave` tu `react-icons/md`
- Nut action dung shared components: `EditButton`, `DeleteButton`
