# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EduVerse is a Learning Management System (LMS) for coding education built with React + TypeScript. The project uses MSW (Mock Service Worker) for API mocking with a persistent in-memory database, allowing full-stack development without a backend server.

**Current State**: Frontend at ~93% completion with admin, student, and professor dashboards. Backend is planned but not yet implemented.

## Development Commands

### Frontend (all commands run in `frontend/` directory)

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3005)
npm run build        # TypeScript check + production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

**Note**: There is no test suite configured yet. The project uses MSW for mocking, not for testing.

### MSW Setup

MSW is initialized in `main.tsx` and must start before React renders:
- Worker files are in `public/` directory (configured via `package.json` "msw.workerDirectory")
- In-memory database persists to localStorage (`__mockDB_*` keys)
- Access debug database via `window.__mockDB` in browser console

## Architecture Overview

### Routing & Authentication

**No Route Guards**: Pages manually check authentication in `useEffect` hooks and redirect based on user roles. This pattern is consistent across all protected pages:

```typescript
useEffect(() => {
  if (authLoading) return
  if (!user) navigate('/login')
  if (user.role !== 'expectedRole') navigate('/other/dashboard')
}, [user, authLoading, navigate])
```

**Role-based Routes**:
- `/student/*` - Student dashboard, course planner, learning page
- `/professor/*` - Professor dashboard, class management
- `/admin/*` - Admin dashboard (7 pages: users, classes, curricula, logs, stats, settings)
- Shared: `/courses`, `/profile`, `/settings`

### State Management

Uses **React Context API** exclusively (no Redux/Zustand):

1. **AuthProvider** (`contexts/AuthContext.tsx`) - User authentication, token storage (localStorage)
2. **ThemeProvider** (`contexts/ThemeContext.tsx`) - Dark/light/system theme
3. **FontProvider** (`contexts/FontContext.tsx`) - Font family selection
4. **ToastProvider** (`contexts/ToastContext.tsx`) - Global notifications

**Provider nesting order** (in `App.tsx`):
```
ErrorBoundary → ThemeProvider → FontProvider → AuthProvider → ToastProvider → Routes
```

### MSW Mock Backend

**Structure**:
```
mocks/
├── browser.ts              # MSW worker setup
├── handlers/
│   ├── index.ts            # Aggregates all handlers
│   ├── auth.ts             # Login, register, verify
│   ├── profile.ts          # User profile operations
│   ├── courses.ts          # Course enrollment, details
│   ├── admin.ts            # Admin CRUD operations
│   └── professor/class.ts  # Professor class management
└── db/
    ├── memory.ts           # In-memory CRUD with localStorage sync
    ├── schema.ts           # TypeScript interfaces for all entities
    └── seed.ts             # 145+ seed users, courses, curricula
```

**Database Features**:
- Automatic localStorage persistence (survives page refresh)
- Soft deletes with `deletedAt` timestamps
- Global debug access: `window.__mockDB`
- CRUD operations: `db.users.create()`, `db.classes.findAll()`, etc.

**Key Pattern**: MSW handlers call `db.*` methods → `db.*` calls `syncToStorage()` → localStorage updated

### Component Organization

```
components/
├── common/          # Reusable UI (Button, Input, Modal, Card, Badge, etc.)
│   └── index.ts     # Centralized exports
├── layout/          # Header, Sidebar, DashboardLayout, StudentLayout
├── professor/       # Professor-specific (CreateClassModal, etc.)
└── learning/        # CodeEditor, CurriculumSidebar, SubmissionHistory
```

**Import Pattern**: Use centralized exports
```typescript
import { Button, Input, Modal } from '@components/common'
```

### Type System

**No centralized types directory** - types are defined near usage:
- MSW entities: `mocks/db/schema.ts`
- Component props: inline or in `common/types.ts`
- Context types: defined with context providers

**Important Types**:
```typescript
// User roles
type UserRole = 'student' | 'professor' | 'admin'

// User interface (from mocks/db/schema.ts)
interface User {
  id: number
  email: string
  name: string
  role: UserRole
  emailVerified: boolean
  // ... plus optional profile fields
}
```

### Path Aliases (vite.config.ts)

```typescript
'@' → './src'
'@components' → './src/components'
'@pages' → './src/pages'
'@hooks' → './src/hooks'
'@services' → './src/services'
'@utils' → './src/utils'
'@types' → './src/types'
'@store' → './src/store'
'@assets' → './src/assets'
```

### Styling

**Tailwind CSS 3.4** with custom theme extensions:
- Custom color palette: `primary`, `secondary`, `success`, `warning`, `error`, `info` (50-900 shades)
- Font families: `pretendard`, `poppins`, `nanum-pen`, `mono`
- Custom animations: `blob` keyframe for background effects
- **Dark mode support**: All pages support dark mode via `ThemeContext`

**Pattern**: Use semantic color classes and dark mode variants
```typescript
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
```

### Custom Hooks

**Essential hooks** in `hooks/`:
- `useApiError.ts` - Standardized API error handling with toast notifications
- `useDebounce.ts` - Input debouncing for search/filters
- `useSearchSuggestions.ts` - Autocomplete functionality
- `useClassManagement.ts` - Professor class CRUD operations

### Utilities

**Key utilities** in `utils/`:
- `apiError.ts` - Error type classification and handling
- `retry.ts` - Request retry logic with exponential backoff
- `formValidation.ts` - Form input validation
- `passwordValidation.ts` - Password strength checking
- `inputValidation.ts` - Input length limits

## Key Architectural Patterns

### Data Flow

```
User Action → Component → Direct fetch() call
                              ↓
                    MSW intercepts request
                              ↓
                    In-memory DB (db.* methods)
                              ↓
                    syncToStorage() → localStorage
                              ↓
                    Response → State update → Re-render
```

### Authentication Flow

1. User submits login → `AuthContext.login()`
2. `fetch('/api/auth/login')` → MSW intercepts
3. MSW validates against `db.users` (email/password)
4. Returns `{ user, token }` (token is mock UUID in development)
5. AuthContext stores in state + localStorage
6. Navigate to role-based dashboard
7. Protected page checks `user.role` and redirects if mismatched

### API Pattern

**Direct fetch calls** (no axios or service layer abstraction):
```typescript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // from AuthContext
  },
  body: JSON.stringify(data)
})
const result = await response.json()
```

MSW handlers intercept these calls and respond with mock data from the in-memory database.

### Development Bypass Mode

**Quick login bypass** in `LoginPage.tsx`:
- Development mode shows quick-access buttons: "Admin Login", "Professor Login", "Student Login"
- Bypasses password validation for faster iteration
- **Do not remove** - essential for rapid development workflow

### Test Accounts

| Role      | Email                      | Password   |
|-----------|----------------------------|------------|
| Admin     | admin@eduverse.com         | admin123   |
| Professor | professor@eduverse.com     | prof123    |
| Student   | student@eduverse.com       | student123 |

Additional test accounts available in `mocks/db/seed.ts` (145+ users)

## Important Conventions

### File Naming
- Components: PascalCase (e.g., `UserManagementPage.tsx`)
- Utilities/hooks: camelCase (e.g., `useApiError.ts`)
- Types/interfaces: PascalCase (e.g., `interface User {}`)

### Component Structure
```typescript
// 1. Imports
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

// 2. Types/Interfaces (if needed)
interface Props { ... }

// 3. Component
const ComponentName = ({ props }: Props) => {
  // 3a. Hooks
  const navigate = useNavigate()
  const { user } = useAuth()

  // 3b. State
  const [data, setData] = useState()

  // 3c. Effects (including auth check)
  useEffect(() => {
    // Auth check pattern
    if (!user) navigate('/login')
  }, [user, navigate])

  // 3d. Handlers
  const handleSubmit = async () => { ... }

  // 3e. Render
  return <div>...</div>
}

export default ComponentName
```

### Dark Mode Support
**Always implement dark mode** when creating new components:
- Use Tailwind's `dark:` prefix for dark mode styles
- Check existing components for patterns
- Test in both light and dark themes

### Error Handling
Use `useApiError` hook for consistent error handling:
```typescript
const handleError = useApiError()

try {
  const response = await fetch(...)
  if (!response.ok) throw await response.json()
} catch (error) {
  handleError(error) // Shows toast notification
}
```

## Working with MSW

### Adding New API Endpoints

1. **Define handler** in `mocks/handlers/[category].ts`:
```typescript
http.post('/api/new-endpoint', async ({ request }) => {
  const body = await request.json()

  // Validate
  if (!body.requiredField) {
    return HttpResponse.json({
      status: 'error',
      message: 'Validation failed'
    }, { status: 400 })
  }

  // Use database
  const result = db.entity.create(body)

  return HttpResponse.json({
    status: 'success',
    data: result
  })
})
```

2. **Export handler** in `mocks/handlers/index.ts`

3. **Add to schema** (if new entity) in `mocks/db/schema.ts`

4. **Add CRUD methods** (if new entity) in `mocks/db/memory.ts`

5. **Add seed data** (optional) in `mocks/db/seed.ts`

### Database Operations

```typescript
// Create
const user = db.users.create({ email, name, role, password })

// Read
const user = db.users.findById(id)
const user = db.users.findByEmail(email)
const users = db.users.findAll() // excludes soft-deleted

// Update
db.users.update(id, { name: 'New Name' })

// Delete (soft delete)
db.users.delete(id) // sets deletedAt timestamp

// Restore
db.users.restore(id) // clears deletedAt
```

## Common Development Tasks

### Creating a New Page

1. Create component in `pages/[role]/` directory
2. Add route to `App.tsx`
3. Implement auth check in `useEffect`
4. Add dark mode support
5. Update navigation (Sidebar or Header) if needed

### Adding a New Feature

1. Check if MSW handlers/database need updates
2. Create/update components
3. Add TypeScript interfaces in schema or inline
4. Implement with dark mode support
5. Add error handling with `useApiError`

### Debugging MSW

- Check browser console for MSW logs (requests/responses)
- Inspect `window.__mockDB` in console
- Check localStorage keys (`__mockDB_*`)
- Review `mocks/handlers/` for endpoint definitions
- Verify `mocks/db/seed.ts` has necessary test data

## Project Structure Summary

```
EduVerse-UI/
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Routes + provider nesting
│   │   ├── main.tsx             # Entry point, MSW initialization
│   │   ├── components/          # Reusable components
│   │   │   ├── common/          # Button, Input, Modal, Card, etc.
│   │   │   ├── layout/          # Layout wrappers
│   │   │   ├── professor/       # Professor-specific
│   │   │   └── learning/        # Learning page components
│   │   ├── contexts/            # Auth, Theme, Font, Toast
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin dashboard (7 pages)
│   │   │   ├── student/         # Student pages
│   │   │   ├── professor/       # Professor pages
│   │   │   └── auth/            # Login, register, verify
│   │   ├── mocks/               # MSW setup
│   │   │   ├── handlers/        # API route handlers
│   │   │   └── db/              # In-memory database
│   │   ├── hooks/               # Custom hooks
│   │   ├── utils/               # Utility functions
│   │   └── types/               # Shared TypeScript types
│   ├── public/                  # Static files + MSW worker
│   └── package.json
├── docs/                        # Project documentation
│   ├── 00-summary/
│   ├── 01-requirements/
│   ├── 02-api/
│   ├── 03-database/
│   └── 04-design/
└── README.md
```

## Backend Integration (Future)

When backend is implemented:
1. Remove MSW initialization from `main.tsx`
2. Update fetch calls to use real API base URL
3. Replace mock JWT tokens with real tokens
4. Keep MSW handlers as reference for API contract
5. Consider keeping MSW for testing

## References

- README.md - Project overview, feature list, tech stack
- docs/ - Detailed documentation for requirements, API specs, database design
- frontend/src/mocks/README.md - MSW setup and database documentation
