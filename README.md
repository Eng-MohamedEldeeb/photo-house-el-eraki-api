# Photo House El Eraki — Backend API

REST API for **Photo House El Eraki**, a photography e-commerce and inventory management system. Built with NestJS, PostgreSQL, and Cloudinary.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 10 |
| Language | TypeScript 5 |
| Database | PostgreSQL + TypeORM 0.3 |
| Auth | JWT (passport-jwt) + bcryptjs |
| File Storage | Cloudinary |
| Excel | ExcelJS 4 |
| Google Sheets | googleapis 140 |
| Validation | class-validator + class-transformer |

---

## Project Structure

```
src/
├── auth/                   # JWT login, guards, strategies
├── admin/                  # Admin entity + seeder
├── products/               # Products CRUD + stock management
├── categories/             # Categories CRUD
├── cloudinary/             # Image upload/delete service
├── import-export/          # Excel & Google Sheets import/export
│   ├── dto/
│   │   ├── import-result.dto.ts
│   │   └── sheets-sync.dto.ts
│   ├── google-sheets.service.ts
│   ├── import-export.service.ts
│   ├── import-export.controller.ts
│   └── import-export.module.ts
└── app.module.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- A [Cloudinary](https://cloudinary.com) account
- A [Google Cloud](https://console.cloud.google.com) project with Sheets API enabled (for Google Sheets sync)

### Installation

```bash
git clone https://github.com/your-username/photo-house-backend.git
cd photo-house-backend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=photo_house

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Sheets (Service Account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"
```

> **Note:** `GOOGLE_PRIVATE_KEY` must use literal `\n` for newlines, not actual line breaks.

### Running the App

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api`.

On first run, a default admin account is seeded automatically:

```
Username: admin
Password: admin123
```

> Change the password immediately in production.

---

## API Reference

All routes are prefixed with `/api`. Admin routes require a `Bearer` token in the `Authorization` header.

### Auth

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/login` | No | Login → returns JWT |

**Request body:**
```json
{ "username": "admin", "password": "admin123" }
```

**Response:**
```json
{ "accessToken": "eyJ...", "admin": { "id": 1, "username": "admin" } }
```

---

### Categories

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/categories` | No | List all categories |
| `GET` | `/api/categories/:id` | No | Get category + its products |
| `POST` | `/api/admin/categories` | **Yes** | Create category |
| `PATCH` | `/api/admin/categories/:id` | **Yes** | Update category |
| `DELETE` | `/api/admin/categories/:id` | **Yes** | Delete category (products unlinked, not deleted) |

---

### Products

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/products` | No | Paginated product list (active only) |
| `GET` | `/api/products/:id` | No | Single product |
| `GET` | `/api/admin/products` | **Yes** | All products including inactive |
| `GET` | `/api/admin/products/stock-summary` | **Yes** | Dashboard KPIs |
| `GET` | `/api/admin/products/:id` | **Yes** | Single product (admin view) |
| `POST` | `/api/admin/products` | **Yes** | Create product + image upload |
| `PATCH` | `/api/admin/products/:id` | **Yes** | Update product + optional image |
| `PATCH` | `/api/admin/products/:id/stock` | **Yes** | Update stock quantities |
| `DELETE` | `/api/admin/products/:id` | **Yes** | Delete product + remove image from Cloudinary |

**Product list query params:**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name |
| `categoryId` | number | Filter by category |
| `stockStatus` | `in_stock` \| `low_stock` \| `out_of_stock` | Filter by stock status |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 12) |

**Paginated response shape:**
```json
{
  "data": [...],
  "meta": { "total": 48, "page": 1, "limit": 12, "totalPages": 4 }
}
```

**Create / Update product** — `multipart/form-data`:

| Field | Type | Required |
|-------|------|----------|
| `nameEn` | string | Yes |
| `nameAr` | string | Yes |
| `price` | number | Yes |
| `stockQuantity` | number | Yes |
| `descriptionEn` | string | No |
| `descriptionAr` | string | No |
| `sku` | string | No |
| `lowStockThreshold` | number | No (default: 10) |
| `categoryId` | number | No |
| `isFeatured` | boolean | No |
| `isActive` | boolean | No |
| `image` | file | No |

---

### Import / Export

All import/export routes require JWT. Uploads are limited to `.xlsx` and `.xls` files.

#### Excel

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/admin/export/products` | **Yes** | Download products as `.xlsx` |
| `GET` | `/api/admin/export/categories` | **Yes** | Download categories as `.xlsx` |
| `POST` | `/api/admin/import/products` | **Yes** | Upload `.xlsx` → upsert products |
| `POST` | `/api/admin/import/categories` | **Yes** | Upload `.xlsx` → upsert categories |

**Import** — `multipart/form-data` with field name `file`:
```bash
curl -X POST http://localhost:3000/api/admin/import/products \
  -H "Authorization: Bearer YOUR_JWT" \
  -F "file=@products.xlsx"
```

**Import response:**
```json
{
  "inserted": 12,
  "updated": 3,
  "skipped": 1,
  "errors": [
    { "row": 5, "message": "price must be a number" }
  ]
}
```

**Upsert strategy:**
- Products → match on `sku` first, then `nameEn`
- Categories → match on `nameEn`
- `stockStatus` is recalculated automatically from `stockQuantity` and `lowStockThreshold`

#### Google Sheets

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/admin/sheets/push/products` | **Yes** | DB → Sheet (overwrite) |
| `POST` | `/api/admin/sheets/push/categories` | **Yes** | DB → Sheet (overwrite) |
| `POST` | `/api/admin/sheets/pull/products` | **Yes** | Sheet → DB (upsert) |
| `POST` | `/api/admin/sheets/pull/categories` | **Yes** | Sheet → DB (upsert) |

**Request body:**
```json
{
  "spreadsheetId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
  "sheetName": "Products"
}
```

> `sheetName` is optional — defaults to `"Products"` or `"Categories"`.

The `spreadsheetId` is the long string in the Google Sheets URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

---

## Google Sheets Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create or select a project.
2. Enable **Google Sheets API**: APIs & Services → Enable APIs → search "Sheets".
3. Create a **Service Account**: IAM & Admin → Service Accounts → Create.
4. Generate a **JSON key**: click the account → Keys → Add Key → JSON.
5. Copy `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL` in `.env`.
6. Copy `private_key` → `GOOGLE_PRIVATE_KEY` in `.env`.
7. Open your Google Sheet → **Share** → paste the `client_email` → give **Editor** access.

---

## Data Models

### Product

```typescript
{
  id:                number;
  nameEn:            string;
  nameAr:            string;
  descriptionEn?:    string;
  descriptionAr?:    string;
  price:             number;        // decimal
  sku?:              string;
  stockQuantity:     number;
  soldQuantity:      number;
  lowStockThreshold: number;        // default: 10
  stockStatus:       'in_stock' | 'low_stock' | 'out_of_stock';
  imageUrl?:         string;
  imagePublicId?:    string;        // Cloudinary ID
  isFeatured:        boolean;
  isActive:          boolean;
  categoryId?:       number;
  category?:         Category;
  createdAt:         Date;
  updatedAt:         Date;
}
```

### Category

```typescript
{
  id:           number;
  nameEn:       string;
  nameAr:       string;
  description?: string;
  products?:    Product[];
  createdAt:    Date;
  updatedAt:    Date;
}
```

---

## Scripts

```bash
npm run start:dev     # development with hot-reload
npm run build         # compile TypeScript
npm run start:prod    # run compiled build
```

---

## Notes

- Images are stored on Cloudinary. Deleting a product also removes its image from Cloudinary.
- `stockStatus` is automatically computed and updated whenever `stockQuantity` or `lowStockThreshold` changes.
- In development, TypeORM `synchronize: true` is enabled — the DB schema is kept in sync automatically. Set `NODE_ENV=production` to disable it.
- No payment integration — purchases are handled offline.
