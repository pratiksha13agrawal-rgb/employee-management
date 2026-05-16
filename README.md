# Employee Management System - Frontend

Angular 21 based Employee Management System with role-based access control.

## Tech Stack
- Angular 21 (Standalone Components)
- Bootstrap 5
- TypeScript
- Chart.js
- XLSX (Import/Export)
- JWT Authentication

## Features
- ✅ Login / Register with JWT
- ✅ Role Based Access (Admin / User)
- ✅ Admin Dashboard with Sidebar
- ✅ Employee CRUD Operations
- ✅ Bulk Import (Excel) with validation
- ✅ Export Excel / PDF
- ✅ Search & Pagination
- ✅ User Profile Management
- ✅ HTTP Interceptor (Auth + Loader)
- ✅ Lazy Loading
- ✅ Signals & RxJS
- ✅ Active/Inactive user management
- ✅ Toast Notifications

## Setup

### Prerequisites
- Node.js 18+
- Angular CLI 21

### Install
```bash
npm install
```

### Configure API URL
Update `src/environments/environment.development.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### Run
```bash
ng serve
```

## Default Roles
| Role | Access |
|------|--------|
| Admin | Full access — CRUD, Import/Export, User management |
| User | Profile view and edit only |

## Bulk Import Format
Excel headers must be lowercase:
name | email | phone | department | salary | role | joinDate

## Backend
[Employee Management Backend](https://github.com/pratiksha13agrawal-rgb/employee-management-backend)

## Author
Pratiksha Agrawal