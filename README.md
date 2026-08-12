# Mini ERP + CRM Operations Portal

A full-stack ERP/CRM operations portal designed for a wholesale and distribution business. The application provides role-based authentication and allows internal teams to manage customers, products, inventory movements, and sales challans through a responsive web interface.

## Live Application

- Frontend: https://mini-erp-crm-operations-portal-omega.vercel.app
- Backend API: https://mini-erp-crm-backend-32jk.onrender.com
- Database: PostgreSQL hosted on Render

---

## 1. Project Overview

The Mini ERP + CRM Operations Portal is designed around common business workflows used by sales, warehouse, and accounts teams.

The application supports:

- JWT-based authentication
- Role-based access
- Customer CRM management
- Product management
- Inventory and stock movement tracking
- Sales challan creation and confirmation
- Automatic stock deduction when a challan is confirmed
- PostgreSQL-based persistent data storage
- REST API communication between frontend and backend

The primary business flow is:

**Customer → Product → Inventory → Sales Challan → Stock Movement**

---

## 2. Key Features

### Authentication & Roles

The application supports four user roles:

- Admin
- Sales
- Warehouse
- Accounts

Authentication is implemented using JWT tokens. The authenticated token is sent with protected API requests using the `Authorization: Bearer <token>` header.

Role information is stored with the user, included in the authenticated JWT, and enforced by backend role guards for protected endpoints.

---

### Customer CRM

The Customer module provides customer management functionality including:

- Add customer
- Edit customer
- Search customers
- View customer details
- Business information
- Mobile number
- Email
- Customer type
- Customer status
- Follow-up date
- Add and update follow-up notes

Supported customer types include:

- Retail
- Wholesale
- Distributor

Customer status can be managed as:

- Lead
- Active
- Inactive

---

### Product Management

The Product module provides:

- Add product
- Edit product
- Product name
- SKU/code
- Category
- Unit price
- Current stock
- Minimum stock alert quantity
- Warehouse/location

The product listing also displays low-stock information based on the configured minimum stock quantity.

---

### Inventory Management

The Inventory module maintains a stock movement history.

Each movement records:

- Product
- Quantity
- Movement type
- Reason
- Created by
- Timestamp

Movement types:

- `IN`
- `OUT`

Inventory changes are reflected in the product's current stock.

---

### Sales Challans

Sales users can create sales challans by:

1. Selecting a customer
2. Selecting products
3. Specifying quantities
4. Generating a challan
5. Saving it as Draft or Confirmed

Challan statuses include:

- Draft
- Confirmed
- Cancelled

Each challan stores a snapshot of the selected customer and product information at the time of creation rather than relying only on product IDs. This preserves the relevant product details associated with the transaction.

When a challan is confirmed:

1. The requested stock is validated.
2. The system checks that sufficient stock is available.
3. Stock is reduced.
4. An inventory movement is recorded against the challan.

This creates the following business flow:

```text
Sales Challan
      ↓
Confirm Challan
      ↓
Validate Stock
      ↓
Reduce Product Stock
      ↓
Create Inventory Movement
````

---

## 3. Technology Stack

### Frontend

* React
* TypeScript
* Vite
* HTML
* CSS
* REST API integration

### Backend

* Node.js
* TypeScript
* NestJS
* REST APIs
* JWT authentication
* bcrypt password hashing

### Database

* PostgreSQL
* TypeORM

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: Render PostgreSQL

---

## 4. Architecture

The application follows a client-server architecture.

```text
                   ┌──────────────────────┐
                   │      React UI        │
                   │   TypeScript/Vite    │
                   └──────────┬───────────┘
                              │
                              │ REST API
                              ▼
                   ┌──────────────────────┐
                   │   NestJS Backend     │
                   │      Node.js         │
                   │   JWT Authentication │
                   └──────────┬───────────┘
                              │
                              │ TypeORM
                              ▼
                   ┌──────────────────────┐
                   │      PostgreSQL      │
                   └──────────────────────┘
```

### Authentication Flow

```text
User Login
    ↓
POST /auth/login
    ↓
Validate Credentials
    ↓
Generate JWT
    ↓
Frontend stores token
    ↓
Bearer token sent with protected requests
    ↓
Backend validates JWT + role
```

### Sales Challan / Inventory Flow

```text
Create Challan
      ↓
Draft / Confirmed
      ↓
Confirm
      ↓
Check Available Stock
      ↓
Reduce Stock
      ↓
Create Inventory Movement
      ↓
Updated Inventory
```

---

## 5. Project Structure

```text
Mini-ERP-CRM-Operations-Portal/
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── customers/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── stock-movements/
│   │   ├── challans/
│   │   └── ...
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
│
└── README.md
```

---

## 6. Environment Variables

Environment variables are used to keep deployment-specific configuration and secrets outside the source code.

### Frontend

Create:

```text
frontend/.env
```

For local development:

```text
VITE_API_BASE_URL=http://localhost:3000
```

For the deployed frontend:

```text
VITE_API_BASE_URL=https://mini-erp-crm-backend-32jk.onrender.com
```

### Backend

Create:

```text
backend/.env
```

Example:

```text
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=<your-database-user>
DB_PASSWORD=<your-database-password>
DB_DATABASE=mini_erp_crm

PORT=3000
FRONTEND_URL=http://localhost:5173
DB_SYNCHRONIZE=true
JWT_SECRET=<your-jwt-secret>
```

For production, database credentials, JWT secrets, and other sensitive values should be configured through the hosting platform's environment variable settings.

Production database synchronization should remain disabled:

```text
DB_SYNCHRONIZE=false
```

Environment files containing secrets should not be committed to the repository.

---

## 7. Local Setup

### Prerequisites

* Node.js
* npm
* PostgreSQL

### Clone the Repository

```bash
git clone https://github.com/sakshimdesai/-Mini-ERP-CRM-Operations-Portal
cd Mini-ERP-CRM-Operations-Portal
```

### Backend Setup

```bash
cd backend
npm install
```

Configure the backend environment variables in `.env`.

Start the backend:

```bash
npm run start:dev
```

The backend runs on:

```text
http://localhost:3000
```

### Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Configure:

```text
VITE_API_BASE_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

The Vite development server runs at:

```text
http://localhost:5173
```

---

## 8. REST API

The backend exposes REST APIs for authentication and business operations.

### Authentication

```text
POST /auth/login
```

Example request:

```json
{
  "username": "sales",
  "password": "Sales@123"
}
```

The login endpoint returns an access token used for authenticated requests.

Authenticated requests use:

```text
Authorization: Bearer <access_token>
```

### Main API Areas

#### Authentication

```text
POST /auth/login
```

#### Customers

```text
GET    /customers
POST   /customers
GET    /customers/:id
PATCH  /customers/:id
DELETE /customers/:id
GET    /customers/search?q=<search>
```

#### Products

```text
GET    /products
POST   /products
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id
```

#### Inventory

```text
GET  /stock-movements
POST /stock-movements
```

#### Sales Challans

```text
GET   /challans
POST  /challans
GET   /challans/:id
PATCH /challans/:id
```

The challan APIs support creation, listing, updating, and confirmation workflows.

---

## 9. Validation & Error Handling

The backend validates incoming requests using NestJS validation pipes and DTO validation.

The application handles cases such as:

* Invalid login credentials
* Unauthorized requests
* Forbidden role access
* Invalid request data
* Duplicate customer email
* Insufficient inventory
* Invalid resource requests

The API returns appropriate HTTP status codes and descriptive error messages.

The frontend displays API error messages to the user instead of silently failing.

Search functionality is implemented for customer records.

Pagination has not been implemented because the evaluation dataset is small. Pagination can be added for larger datasets and is listed as a future improvement.

---

## 10. Database

PostgreSQL is used as the persistent database.

The application stores business entities including:

* Users
* Customers
* Products
* Inventory records
* Sales challans
* Related business records

The users table stores:

* User ID
* Username
* Hashed password
* Role
* Created timestamp
* Updated timestamp

Passwords are stored using bcrypt hashing rather than plain text.

---

## 11. Test Credentials

The following test accounts are available for evaluation:

| Role      | Username  | Password      |
| --------- | --------- | ------------- |
| Admin     | admin     | Admin@123     |
| Sales     | sales     | Sales@123     |
| Warehouse | warehouse | Warehouse@123 |
| Accounts  | accounts  | Accounts@123  |

These credentials are provided for evaluation of the deployed application.

---

## 12. Deployment

### Frontend

The React frontend is deployed using Vercel.

```text
GitHub Repository
       ↓
     Vercel
       ↓
React Production Build
       ↓
Live Frontend
```

The deployed frontend uses the `VITE_API_BASE_URL` environment variable to communicate with the backend.

### Backend

The NestJS backend is deployed using Render.

```text
GitHub Repository
       ↓
     Render
       ↓
NestJS Application
       ↓
REST API
```

The backend uses environment variables for database configuration, CORS configuration, and application secrets.

### Database

PostgreSQL is hosted using Render PostgreSQL and is accessed by the backend through environment-based database configuration.

---

## 13. Business Logic

### Stock Deduction

When a sales challan is confirmed, the backend:

1. Retrieves the requested product quantities.
2. Checks the current stock.
3. Validates stock availability.
4. Rejects the operation when sufficient stock is unavailable.
5. Updates the product stock.
6. Records the corresponding inventory movement.

This ensures that confirmed sales challans are reflected in inventory.

### Inventory Movement

Stock changes are represented as inventory movements.

Example:

```text
Stock In:
+1

Stock Out:
-5

Sales Challan:
-1
```

This provides an audit trail of inventory changes.

---

## 14. Security

The application includes:

* JWT-based authentication
* Role-based access control
* Password hashing using bcrypt
* Protected API requests
* Environment variables for secrets and database configuration
* No plain-text password storage

Production secrets should never be committed to the repository.

---

## 15. Responsive UI

The frontend provides an admin-style interface for managing ERP operations.

Main sections include:

* Dashboard
* Customers
* Products
* Inventory
* Sales Challans

The interface provides tables, forms, status indicators, search functionality, and action controls for the respective business workflows.

---

## 16. Deployment & Environment Assumptions

The application is deployed using free hosting platforms permitted by the assignment:

* Vercel for frontend
* Render for backend
* Render PostgreSQL for database

AWS was not used because the assignment permits alternative free hosting platforms and treats AWS deployment as an optional bonus.

The application is demonstrated using an evaluation dataset rather than production-scale data.

---

## 17. Known Limitations

The project focuses on the core ERP/CRM workflows requested in the case study.

The following optional bonus features were not implemented:

* AWS deployment
* Docker setup
* GitHub Actions deployment
* Invoice PDF export
* AWS S3 product image upload

The application is intended as a case-study implementation rather than a production ERP system and therefore does not attempt to cover the complete scope of a commercial ERP platform.

---

## 18. Future Improvements

Possible extensions include:

* Pagination for larger datasets
* Advanced reporting and analytics
* Invoice generation
* Purchase order management
* Product image management
* More granular permissions within each role
* Automated testing and CI/CD
* Docker-based deployment
* Advanced audit logging

---

## 19. End-to-End Demo Flow

The primary business workflow can be demonstrated as:

```text
Login
  ↓
Dashboard
  ↓
Customers
  ↓
Products
  ↓
Inventory
  ↓
Create Sales Challan
  ↓
Confirm Challan
  ↓
Stock Automatically Reduced
  ↓
Inventory Movement Recorded
```

This demonstrates the connection between the CRM, product, inventory, and sales operations.

---

## 20. Submission Links

### GitHub Repository

[https://github.com/sakshimdesai/-Mini-ERP-CRM-Operations-Portal](https://github.com/sakshimdesai/-Mini-ERP-CRM-Operations-Portal)

### Live Frontend

[https://mini-erp-crm-operations-portal-omega.vercel.app](https://mini-erp-crm-operations-portal-omega.vercel.app)

### Live Backend API

[https://mini-erp-crm-backend-32jk.onrender.com](https://mini-erp-crm-backend-32jk.onrender.com)

---

## 21. Conclusion

The Mini ERP + CRM Operations Portal demonstrates a complete full-stack business workflow using React, TypeScript, NestJS, PostgreSQL, REST APIs, JWT authentication, and role-based access control.

The implementation focuses on the core requirements of the case study while maintaining separation between the frontend, backend, database, authentication, and business logic layers.

```


