# Evaluation Modules — (Luồng dữ liệu & kiến trúc)

## 1. Tổng quan kiến trúc

Hệ thống Evaluation là một **feature module** của DELO Kiosk Server, được load động qua `FEATURES_ENABLE` env var. Nó cho phép admin tự cấu hình các bài đánh giá mà không cần sửa code, và người dùng cuối (khách hàng tại kiosk) có thể gửi đánh giá qua thiết bị.

Module này nằm tại `src/evaluation/`, gồm **6 sub-modules**:

| #   | Module       | Route prefix           | Mục đích                                                     |
| --- | ------------ | ---------------------- | ------------------------------------------------------------ |
| 1   | **topics**   | `evaluation/topics`    | Chủ đề đánh giá (VD: "Dịch vụ", "Nhân viên")                 |
| 2   | **targets**  | `evaluation/targets`   | Đối tượng đánh giá (VD: "Anh Nam", "Quầy số 1")              |
| 3   | **actions**  | `evaluation/actions`   | Nút hành động / cảm xúc (VD: "😍 Rất hài lòng", icon, color) |
| 4   | **contents** | `evaluation/contents`  | Nội dung chi tiết (VD: "Thái độ kém", "Xử lý chậm")          |
| 5   | **records**  | `evaluation/records`   | Bản ghi đánh giá (người dùng gửi)                            |
| 6   | **reports**  | `evaluation/reports/*` | Báo cáo, thống kê, export                                    |

**Module tree:**

```
EvaluationModule (evaluation.module.ts)
 ├── EvaluationTopicModule
 ├── EvaluationTargetModule
 ├── EvaluationActionModule  (có UploadModule)
 ├── EvaluationContentModule
 ├── EvaluationRecordModule
 └── EvaluationReportsModule
```

Tất cả sub-modules đều được import trong `evaluation.module.ts` dưới dạng `@Module({ imports: [...] })`.

---

## 2. Kiến trúc BaseService (CRUD xương sống)

### BaseService<T> (`src/common/base/base-service.ts`)

Đây là abstract generic class cung cấp sẵn 5 method CRUD chuẩn cho mọi entity. Tất cả service của Evaluation đều extends BaseService.

```typescript
abstract class BaseService<T extends ObjectLiteral> {
  constructor(
    protected serviceName: string,
    protected repository: Repository<T>,
  )

  // CREATE — tạo mới entity từ DeepPartial data
  async create({ data }: CreateDto<T>, requestId?: string): Promise<T>

  // FIND ALL — phân trang + search (ILike) + sắp xếp
  async findAll({ where, relations, skip, take, order, search, select }: FindManyDto<T>, requestId?)
    → { page, totalPages, pageSize, totalItems, items }

  // FIND ONE — tìm theo where conditions
  async findOne({ where, relations, select }: FindOneDto<T>, requestId?): Promise<T>

  // UPDATE — merge entity + save
  async update({ where, data, relations, select }: UpdateDto<T>, requestId?): Promise<T>

  // REMOVE — soft delete (remove) hoặc hard delete (delete)
  async remove({ where, method }: DeleteDto<T>, requestId?)
}
```

**Error handling pattern:** Mọi method đều wrap trong try/catch. Lỗi được throw dưới dạng `HttpException` với code và message:

- `{ code: 'ENTITY_NOT_FOUND', message: 'Entity not found' }` → 404
- `{ code: 'ERROR_ACTION_ENTITY', message: 'Internal server error' }` → 500

### Generic DTOs

| DTO              | File                           | Fields                                                                   |
| ---------------- | ------------------------------ | ------------------------------------------------------------------------ |
| `CreateDto<T>`   | `common/dtos/create.dto.ts`    | `data: DeepPartial<T>`, `file?: Express.Multer.File`                     |
| `UpdateDto<T>`   | `common/dtos/update.dto.ts`    | `where`, `data`, `relations?`, `file?`, `select?`                        |
| `FindOneDto<T>`  | `common/dtos/find-one.dto.ts`  | `where?`, `relations?`, `select?`                                        |
| `FindManyDto<T>` | `common/dtos/find-many.dto.ts` | `where?`, `relations?`, `take?`, `skip?`, `order?`, `search?`, `select?` |
| `DeleteDto<T>`   | `common/dtos/delete.dto.ts`    | `where`, `method?: DeleteMethod (REMOVE \| DELETE)`                      |

### Các service Evaluation dùng chung BaseService

| Service                    | Extends BaseService | Ghi chú                                                                  |
| -------------------------- | ------------------- | ------------------------------------------------------------------------ |
| `EvaluationTopicService`   | ✅                  | Không override method nào                                                |
| `EvaluationTargetService`  | ✅                  | Không override method nào                                                |
| `EvaluationActionService`  | ✅                  | Override: `createWithIcon`, `updateWithIcon`, `remove` (xử lý file icon) |
| `EvaluationContentService` | ✅                  | Không override method nào                                                |
| `EvaluationRecordService`  | ✅                  | Override: `createRecord` (tạo record + recordContents cùng lúc)          |
| `EvaluationReportsService` | ❌                  | Service đặc thù, không dùng BaseService                                  |

---

## 3. Entities và quan hệ dữ liệu

### Sơ đồ ER (Relationships)

```
Organization (1) ──→ (N) EvaluationTopic
                           │
                           │ (1)
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼ (N)         ▼ (N)
           EvaluationTarget  EvaluationAction
                                 │
                                 │ (1)
                                 │
                                 ▼ (N)
                          EvaluationContent
                                    │
                                    │ (N)
                                    │
EvaluationRecord ──── (N) ──── EvaluationRecordContent ──── (N) ────┘
     │
     │ (N) ── EvaluationTopic
     │ (N) ── EvaluationTarget
     │ (N) ── EvaluationAction
     │ (N) ── Organization (từ token, không lưu user reviewer)
```

### Chi tiết từng Entity

#### EvaluationTopic (bảng `evaluation_topics`)

| Field                     | Type                        | Ghi chú                          |
| ------------------------- | --------------------------- | -------------------------------- |
| `id`                      | `@PrimaryGeneratedColumn()` | Auto-increment integer PK        |
| `organizationId`          | `number`                    | FK → Organization, có `@Index()` |
| `name`                    | `string(255)`               | Tên chủ đề                       |
| `description`             | `text?`                     | Mô tả                            |
| `isActive`                | `boolean` (default true)    | Trạng thái hoạt động             |
| `displayOrder`            | `int` (default 0)           | Thứ tự hiển thị                  |
| `createdAt` / `updatedAt` | `timestamptz`               | Auto bởi TypeORM                 |

**Relationships:**

```typescript
@ManyToOne(() => Organization)               // N:1 → Organization
@OneToMany(() => EvaluationTarget)            // 1:N → EvaluationTarget
@OneToMany(() => EvaluationAction)             // 1:N → EvaluationAction
@OneToMany(() => EvaluationRecord)             // 1:N → EvaluationRecord
```

#### EvaluationTarget (bảng `evaluation_targets`)

| Field                     | Type                        | Ghi chú                             |
| ------------------------- | --------------------------- | ----------------------------------- |
| `id`                      | `@PrimaryGeneratedColumn()` | Auto-increment integer PK           |
| `topicId`                 | `number`                    | FK → EvaluationTopic, có `@Index()` |
| `name`                    | `string(255)`               | Tên đối tượng                       |
| `description`             | `text?`                     | Mô tả                               |
| `isActive`                | `boolean` (default true)    | Trạng thái hoạt động                |
| `displayOrder`            | `int` (default 0)           | Thứ tự hiển thị                     |
| `createdAt` / `updatedAt` | `timestamptz`               | Auto                                |

**Relationships:**

```typescript
@ManyToOne(() => EvaluationTopic, (topic) => topic.targets)  // N:1 → EvaluationTopic
// Không có OneToMany xuôi — EvaluationTarget không biết Record
```

#### EvaluationAction (bảng `evaluation_actions`)

| Field                     | Type                        | Ghi chú                                               |
| ------------------------- | --------------------------- | ----------------------------------------------------- |
| `id`                      | `@PrimaryGeneratedColumn()` | Auto-increment integer PK                             |
| `topicId`                 | `number`                    | FK → EvaluationTopic, có `@Index()`                   |
| `label`                   | `string(255)`               | Nhãn nút (VD: "Rất hài lòng")                         |
| `icon`                    | `string(255)?`              | Tên file icon (upload qua `/evaluation/actions/icon`) |
| `color`                   | `string(50)?`               | Mã màu (VD: "#22c55e")                                |
| `displayOrder`            | `int` (default 0)           | Thứ tự hiển thị                                       |
| `isActive`                | `boolean` (default true)    | Trạng thái hoạt động                                  |
| `createdAt` / `updatedAt` | `timestamptz`               | Auto                                                  |

**Relationships:**

```typescript
@ManyToOne(() => EvaluationTopic, (topic) => topic.actions)   // N:1 → EvaluationTopic
@OneToMany(() => EvaluationContent)                            // 1:N → EvaluationContent
```

#### EvaluationContent (bảng `evaluation_contents`)

| Field                     | Type                        | Ghi chú                              |
| ------------------------- | --------------------------- | ------------------------------------ |
| `id`                      | `@PrimaryGeneratedColumn()` | Auto-increment integer PK            |
| `actionId`                | `number`                    | FK → EvaluationAction, có `@Index()` |
| `content`                 | `string(500)`               | Nội dung đánh giá chi tiết           |
| `displayOrder`            | `int` (default 0)           | Thứ tự hiển thị                      |
| `isActive`                | `boolean` (default true)    | Trạng thái hoạt động                 |
| `createdAt` / `updatedAt` | `timestamptz`               | Auto                                 |

**Relationships:**

```typescript
@ManyToOne(() => EvaluationAction, (action) => action.contents)  // N:1 → EvaluationAction
@OneToMany(() => EvaluationRecordContent)                         // 1:N → EvaluationRecordContent
```

#### EvaluationRecord (bảng `evaluation_records`)

| Field            | Type                        | Ghi chú                                      |
| ---------------- | --------------------------- | -------------------------------------------- |
| `id`             | `@PrimaryGeneratedColumn()` | Auto-increment integer PK                    |
| `organizationId` | `number`                    | FK → Organization, có `@Index()`             |
| `topicId`        | `number`                    | FK → EvaluationTopic, có `@Index()`          |
| `targetId`       | `number`                    | FK → EvaluationTarget, có `@Index()`         |
| `actionId`       | `number`                    | FK → EvaluationAction, có `@Index()`         |
| `createdAt`      | `timestamptz`               | Auto (không có updatedAt — record không sửa) |

**Relationships:**

```typescript
@ManyToOne(() => Organization)                  // N:1 → Organization
@ManyToOne(() => EvaluationTopic)               // N:1 → EvaluationTopic
@ManyToOne(() => EvaluationTarget)              // N:1 → EvaluationTarget
@ManyToOne(() => EvaluationAction)              // N:1 → EvaluationAction
@OneToMany(() => EvaluationRecordContent)        // 1:N → EvaluationRecordContent
```

#### EvaluationRecordContent (bảng `evaluation_record_contents`) — Bảng N-N

| Field       | Type                        | Ghi chú                               |
| ----------- | --------------------------- | ------------------------------------- |
| `id`        | `@PrimaryGeneratedColumn()` | Auto-increment integer PK             |
| `recordId`  | `number`                    | FK → EvaluationRecord, có `@Index()`  |
| `contentId` | `number`                    | FK → EvaluationContent, có `@Index()` |
| `createdAt` | `timestamptz`               | Auto                                  |

**Unique constraint:** `UNIQUE('record_id', 'content_id')` — mỗi nội dung chỉ được chọn 1 lần trong 1 record.

**Relationships:**

```typescript
@ManyToOne(() => EvaluationRecord)              // N:1 → EvaluationRecord
@ManyToOne(() => EvaluationContent)             // N:1 → EvaluationContent
```

---

## 4. Luồng CRUD Config Layer (Admin quản lý)

Đây là luồng **admin cấu hình** các danh mục đánh giá. Tất cả đều yêu cầu JWT auth + guard phức hợp.

### Guard pattern chung

```typescript
@UseGuards(
  AndGuard(
    JwtAuthGuard,
    OrGuard(
      AndGuard(OrganizationsGuard, PermissionsGuard),
      RolesGuard,
    ),
  ),
)
@Roles('superadmin', 'supadmin')
```

Nghĩa là: phải có JWT hợp lệ, VÀ (có OrganizationsGuard + PermissionsGuard HOẶC có RolesGuard). Tất cả đều yêu cầu role `superadmin` hoặc `supadmin`.

### 4.1 Topics (`evaluation/topics`)

**Controller:** `EvaluationTopicController`

| Method   | Route                    | Permission                 | Mô tả                                        |
| -------- | ------------------------ | -------------------------- | -------------------------------------------- |
| `POST`   | `/evaluation/topics`     | `evaluation-topics.create` | Tạo topic mới (gán organizationId từ token)  |
| `GET`    | `/evaluation/topics`     | `evaluation-topics.view`   | Danh sách topic (phân trang, search, filter) |
| `GET`    | `/evaluation/topics/:id` | `evaluation-topics.view`   | Chi tiết 1 topic                             |
| `PATCH`  | `/evaluation/topics/:id` | `evaluation-topics.edit`   | Cập nhật topic                               |
| `DELETE` | `/evaluation/topics/:id` | `evaluation-topics.delete` | Xóa topic                                    |

**DTOs:**

- `CreateEvaluationTopicDto`: `name` (string, 2-255), `description?` (string), `isActive?` (boolean), `displayOrder?` (number)
- `UpdateEvaluationTopicDto`: Partial của Create (không omit field nào)

**Logic đặc biệt:**

- **Create**: Tự động gán `organizationId` từ `req.user`
- **FindAll**: Nếu organizationId != 0 (không phải superadmin), filter theo `organizationId`
- Scope: Organization-bound (mỗi organization thấy topics của riêng mình)

### 4.2 Targets (`evaluation/targets`)

**Controller:** `EvaluationTargetController`

| Method   | Route                     | Permission                  | Mô tả                                         |
| -------- | ------------------------- | --------------------------- | --------------------------------------------- |
| `POST`   | `/evaluation/targets`     | `evaluation-targets.create` | Tạo target mới (yêu cầu `topicId`)            |
| `GET`    | `/evaluation/targets`     | `evaluation-targets.view`   | Danh sách target (phân trang, search, filter) |
| `GET`    | `/evaluation/targets/:id` | `evaluation-targets.view`   | Chi tiết 1 target                             |
| `PATCH`  | `/evaluation/targets/:id` | `evaluation-targets.edit`   | Cập nhật target                               |
| `DELETE` | `/evaluation/targets/:id` | `evaluation-targets.delete` | Xóa target                                    |

**DTOs:**

- `CreateEvaluationTargetDto`: `topicId` (number), `name` (string), `description?`, `isActive?`, `displayOrder?`
- `UpdateEvaluationTargetDto`: Partial (omit `topicId`)

**Logic đặc biệt:**

- **FindAll**: Organization scope được check qua nested path `topic.organizationId`
- Target thuộc về Topic (N:1), không có FK trực tiếp đến Organization

### 4.3 Actions (`evaluation/actions`)

**Controller:** `EvaluationActionController` — module phức tạp nhất (có upload icon)

| Method   | Route                          | Permission                  | Mô tả                                  |
| -------- | ------------------------------ | --------------------------- | -------------------------------------- |
| `POST`   | `/evaluation/actions`          | `evaluation-actions.create` | Tạo action (không icon)                |
| `POST`   | `/evaluation/actions/icon`     | `evaluation-actions.create` | Tạo action + upload icon (multipart)   |
| `GET`    | `/evaluation/actions`          | `evaluation-actions.view`   | Danh sách action                       |
| `GET`    | `/evaluation/actions/:id`      | `evaluation-actions.view`   | Chi tiết 1 action                      |
| `PATCH`  | `/evaluation/actions/:id`      | `evaluation-actions.edit`   | Cập nhật action (không icon)           |
| `PATCH`  | `/evaluation/actions/:id/icon` | `evaluation-actions.edit`   | Cập nhật action + icon mới (multipart) |
| `DELETE` | `/evaluation/actions/:id`      | `evaluation-actions.delete` | Xóa action (có xóa icon file)          |

**DTOs:**

- `CreateEvaluationActionDto`: `topicId` (number), `label` (string, 1-255), `icon?` (string), `color?` (string, max 50), `displayOrder?`, `isActive?`
- `UpdateEvaluationActionDto`: Partial (omit `topicId`)

**Upload logic (`@UseUpload`):**

```typescript
@UseUpload('file', './evaluation-icons', {
  allowedExtensions: ['png', 'jpg', 'jpeg', 'svg', 'webp'],
  maxSize: 4 * 1024 * 1024  // 4MB
})
```

**EvaluationActionService** override 3 methods:

1. **`createWithIcon`**: Lưu file → gán `data.icon = file.filename` → gọi `create()` từ BaseService
2. **`updateWithIcon`**: Tìm action cũ → lưu file mới → xóa icon cũ (nếu có) → merge + save
3. **`remove`**: Tìm action → xóa icon file trước → xóa record

### 4.4 Contents (`evaluation/contents`)

**Controller:** `EvaluationContentController`

| Method   | Route                      | Permission                   | Mô tả                                |
| -------- | -------------------------- | ---------------------------- | ------------------------------------ |
| `POST`   | `/evaluation/contents`     | `evaluation-contents.create` | Tạo content mới (yêu cầu `actionId`) |
| `GET`    | `/evaluation/contents`     | `evaluation-contents.view`   | Danh sách content                    |
| `GET`    | `/evaluation/contents/:id` | `evaluation-contents.view`   | Chi tiết 1 content                   |
| `PATCH`  | `/evaluation/contents/:id` | `evaluation-contents.edit`   | Cập nhật content                     |
| `DELETE` | `/evaluation/contents/:id` | `evaluation-contents.delete` | Xóa content                          |

**DTOs:**

- `CreateEvaluationContentDto`: `actionId` (number), `content` (string, 1-500), `displayOrder?`, `isActive?`
- `UpdateEvaluationContentDto`: Partial (omit `actionId`)

**Logic đặc biệt:**

- **FindAll**: Organization scope check qua nested path `action.topic.organizationId` (3 cấp depth)

---

## 5. Luồng ghi nhận đánh giá (Record Layer)

Đây là luồng **người dùng cuối gửi đánh giá** từ kiosk. Không yêu cầu guard phức tạp như config layer.

### Luồng UX (client-side, do frontend xử lý)

```
Bước 1: Chọn EvaluationTopic  →  GET /evaluation/topics?isActive=true
Bước 2: Chọn EvaluationTarget →  GET /evaluation/targets?topicId=X&isActive=true
Bước 3: Chọn EvaluationAction →  GET /evaluation/actions?topicId=X&isActive=true
Bước 4: Chọn EvaluationContent(s) →  GET /evaluation/contents?actionId=X&isActive=true
Bước 5: Gửi đánh giá          →  POST /evaluation/records
```

### POST /evaluation/records

**Controller:** `EvaluationRecordController.create()`

**Guard:** Chỉ `@UseGuards(JwtAuthGuard)` — không cần OrganizationsGuard hay PermissionsGuard, vì đây là endpoint public cho device/kiosk (chỉ cần JWT).

**CreateEvaluationRecordDto:**

```typescript
{
  topicId: number;       // ID của chủ đề
  targetId: number;      // ID của đối tượng
  actionId: number;      // ID của hành động được chọn
  contentIds?: number[]; // Mảng IDs của các nội dung chi tiết (optional, multi-select)
}
```

**Service logic (`EvaluationRecordService.createRecord()`):**

```typescript
async createRecord(dto, organizationId, requestId?) {
  1. Tách contentIds khỏi dto
  2. Tạo EvaluationRecord: { ...recordData, organizationId }
     (organizationId lấy từ token, KHÔNG từ body)
  3. Nếu có contentIds → tạo EvaluationRecordContent cho mỗi contentId
  4. Trả về record kèm relations: recordContents + recordContents.content
}
```

**Điểm đặc biệt:**

- `organizationId` được gán từ `req.user.organizationId` (token), không từ body
- Không lưu thông tin người đánh giá (anonymous)
- Một record có thể chọn nhiều content (N-N qua bảng EvaluationRecordContent)
- Record chỉ có `createdAt`, không có `updatedAt` (bất biến sau khi tạo)

### GET /evaluation/records (Admin xem danh sách)

- Guard: `OrganizationsGuard + PermissionsGuard` HOẶC `RolesGuard`
- Yêu cầu permission `evaluation-records.view`
- Kèm relations `['recordContents', 'recordContents.content']`

### GET /evaluation/records/:id (Admin xem chi tiết)

- Tương tự guard như findAll
- Kèm relations `['recordContents', 'recordContents.content']`

---

## 6. Luồng báo cáo (Reports)

**Controller:** `EvaluationReportsController`
**Service:** `EvaluationReportsService` (KHÔNG extends BaseService — tự xử lý query phức tạp)

Tất cả đều yêu cầu: `JwtAuthGuard + (OrganizationsGuard + PermissionsGuard | RolesGuard)` + role `superadmin/supadmin` + permission `evaluation-reports.view`.

### 6.1 GET /evaluation/reports/overview

**Query params:** `from?`, `to?`, `topicId?` (ReportQueryDto)

**Response:**

```json
{
  "totalRecords": 1234,
  "todayCount": 45,
  "weekCount": 312,
  "dailyTrend": [
    { "date": "2026-05-26", "count": 45 },
    { "date": "2026-05-27", "count": 62 }
  ],
  "topicBreakdown": [{ "topicId": 1, "topicName": "Dịch vụ", "count": 800 }]
}
```

**SQL queries:**

1. `COUNT(*)` toàn bộ records của organization
2. `COUNT(*)` WHERE createdAt >= hôm nay 00:00
3. `COUNT(*)` WHERE createdAt >= 7 ngày trước
4. `GROUP BY DATE(created_at)` — 7 ngày gần nhất
5. `GROUP BY topic_id` LEFT JOIN topics — phân bố theo chủ đề

### 6.2 GET /evaluation/reports/topics/:id

**Logic:**

1. Kiểm tra topic tồn tại và thuộc organization
2. `COUNT(*)` records theo topicId
3. `GROUP BY action_id` LEFT JOIN actions → phân bố action (kèm percentage)
4. `GROUP BY target_id` LEFT JOIN targets → top 10 targets

**Response:**

```json
{
  "topicId": 1,
  "topicName": "Dịch vụ",
  "totalRecords": 500,
  "actionDistribution": [
    {
      "actionId": 1,
      "label": "Rất hài lòng",
      "icon": "👍",
      "count": 300,
      "percentage": 60.0
    }
  ],
  "topTargets": [{ "targetId": 1, "name": "Anh Nam", "count": 200 }]
}
```

### 6.3 GET /evaluation/reports/targets/:id

**Logic:**

1. Kiểm tra target tồn tại
2. `COUNT(*)` records theo targetId
3. `GROUP BY action_id` → action summary
4. Lấy 50 records gần nhất (kèm relations: action, recordContents.content)

### 6.4 GET /evaluation/reports/trends

**Query params:** `from?`, `to?`, `topicId?`, `groupBy?: 'day' | 'week' | 'month'`

**Logic:**

- Dùng `DATE_TRUNC` theo groupBy (`DATE` cho day, `DATE_TRUNC('week')` cho week, `DATE_TRUNC('month')` cho month)
- `GROUP BY period, action_id`
- Pivot data thành dạng: mỗi period chứa map action → count

**Response:**

```json
{
  "groupBy": "month",
  "trends": [
    {
      "period": "2026-05-01",
      "actions": { "Rất hài lòng": 150, "Không hài lòng": 30 }
    },
    {
      "period": "2026-06-01",
      "actions": { "Rất hài lòng": 200, "Không hài lòng": 20 }
    }
  ]
}
```

### 6.5 GET /evaluation/reports/complaints

**Logic:**

- Query từ bảng `evaluation_record_contents` (recordContentRepository)
- `GROUP BY content_id` LEFT JOIN contents + actions + records
- WHERE organization_id
- ORDER BY count DESC LIMIT N (default 10)

**Response:**

```json
{
  "complaints": [
    {
      "contentId": 1,
      "content": "Thái độ phục vụ kém",
      "actionLabel": "Không hài lòng",
      "count": 85
    }
  ]
}
```

### 6.6 GET /evaluation/reports/export

**Query params:** `from?`, `to?`, `topicId?`, `targetId?`, `actionId?`

**Logic:**

1. Query raw records với JOIN topic, target, action
2. Với mỗi record, lấy danh sách content đã chọn (STRING_AGG)
3. Map content vào records

**Response:**

```json
{
  "records": [
    {
      "recordId": 1,
      "evaluatedAt": "2026-06-01T10:30:00Z",
      "topicName": "Dịch vụ",
      "targetName": "Anh Nam",
      "actionLabel": "Rất hài lòng",
      "actionIcon": "👍",
      "selectedContents": "Thái độ tốt, Nhanh chóng"
    }
  ]
}
```

---

## 7. Tổng kết luồng dữ liệu

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CONFIG LAYER (Admin)                            │
│                                                                     │
│  POST /evaluation/topics                                            │
│  ┌────────────────┐     ┌──────────────────┐     ┌───────────────┐  │
│  │ EvaluationTopic │────→│ EvaluationTarget │     │ Organization  │  │
│  └────────┬───────┘     └──────────────────┘     └───────┬───────┘  │
│           │                                              │           │
│           ▼                                              │           │
│  ┌──────────────────┐                                    │           │
│  │ EvaluationAction  │──── (icon upload → evaluation-icons/)         │
│  └────────┬─────────┘                                    │           │
│           │                                              │           │
│           ▼                                              │           │
│  ┌──────────────────┐                                    │           │
│  │ EvaluationContent │                                    │           │
│  └──────────────────┘                                    │           │
└──────────────────────────────────────────────────────────┼───────────┘
                                                           │
                                                           │ organizationId
                                                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     RECORD LAYER (End-user)                         │
│                                                                     │
│  POST /evaluation/records                                           │
│  ┌─────────────────┐    ┌─────────────────────────┐                │
│  │ EvaluationRecord │───→│ EvaluationRecordContent │──→ EvaluationContent
│  │ (topicId)        │    │ (N-N join table)        │                │
│  │ (targetId)       │    └─────────────────────────┘                │
│  │ (actionId)       │                                              │
│  │ (organizationId) │                                              │
│  └─────────────────┘                                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     REPORT LAYER (Thống kê)                         │
│                                                                     │
│  /overview  → COUNT, GROUP BY date, topic                           │
│  /topics/:id → GROUP BY action, target                              │
│  /targets/:id → GROUP BY action, recent records                     │
│  /trends     → DATE_TRUNC, pivot action by period                   │
│  /complaints → TOP N content (group by content_id)                  │
│  /export     → Raw records + content aggregation                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Permissions mapping

| Permission string         | Modules                               |
| ------------------------- | ------------------------------------- |
| `evaluation-topics.*`     | topics (create, view, edit, delete)   |
| `evaluation-targets.*`    | targets (create, view, edit, delete)  |
| `evaluation-actions.*`    | actions (create, view, edit, delete)  |
| `evaluation-contents.*`   | contents (create, view, edit, delete) |
| `evaluation-records.view` | records (view list, view detail)      |
| `evaluation-reports.view` | reports (all 6 endpoints)             |

### Key Architectural Decisions

1. **BaseService tái sử dụng:** 4/6 module CRUD đơn giản kế thừa hoàn toàn từ BaseService, chỉ cần định nghĩa entity + module + controller
2. **Anonymous reviews:** EvaluationRecord không lưu thông tin người đánh giá, chỉ gắn organizationId từ JWT token
3. **N-N Content Selection:** Dùng bảng trung gian `evaluation_record_contents` với UNIQUE constraint tránh trùng lặp
4. **File upload riêng cho Action:** Icon được upload riêng qua `/evaluation/actions/icon` với validation (4MB, whitelist extensions)
5. **Date filtering pattern:** Tất cả report dùng `buildDateFilter()` chung — `Between(from, to)` với fallback values
6. **Organization isolation:** Mọi query đều filter theo `organizationId` — lấy từ token, không từ request body
7. **TypeORM auto-sync:** Entity được auto-load, DB schema đồng bộ tự động qua `synchronize: true`
