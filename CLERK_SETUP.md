# Clerk Authentication Setup Guide

This document describes the **optimized** Clerk authentication integration for BrandLens.

## Overview

BrandLens uses [Clerk](https://clerk.com) for user authentication and management. The integration includes:

- ✅ **User sign-up and sign-in flows** with seamless UX
- ✅ **Protected API routes** with auth helpers
- ✅ **User dashboard** with project management
- ✅ **Session management** with auto-restore
- ✅ **Admin role-based access control** with middleware protection
- ✅ **Ownership verification** for all user resources
- ✅ **Consistent error handling** across all routes

## Environment Variables

Required environment variables in `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
```

See `.env.example` for a template.

## Getting Your Clerk Keys

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Go to **API Keys** in the Clerk Dashboard
4. Copy your Publishable Key and Secret Key
5. Add them to your `.env.local` file

## Features Implemented

### 1. Authentication Pages

- **Sign Up**: `/sign-up` - New user registration
- **Sign In**: `/sign-in` - Existing user login
- Both pages include BrandLens branding and redirect handling

### 2. Protected Routes

The following routes require authentication:

- `/dashboard` - User dashboard with project list
- `/api/projects` - Create and manage projects
- `/api/projects/[id]` - View specific project
- `/api/projects/[id]/progress` - Check project progress
- `/api/projects/[id]/stream` - Real-time project updates
- `/api/user/projects` - Fetch user's projects

### 3. Public Routes

These routes remain publicly accessible:

- `/` - Homepage (authentication optional)
- `/report/[token]` - Public report viewing via token
- `/api/reports/[token]` - Report data via token
- `/api/reports/email` - Email report functionality
- `/api/health` - Health check endpoint

### 4. Admin Routes

These routes require authentication AND admin role:

- `/api/admin/stats` - System statistics
- `/api/admin/benchmarks` - Industry benchmarks management
- `/api/debug/logs` - Debug logs viewer

To set a user as admin, see the "Admin Setup" section below.

### 5. User Dashboard

Located at `/dashboard`, the dashboard provides:

- User profile information
- List of all user's projects
- Project status tracking
- Quick access to reports
- Stats overview (total, completed, in-progress)

### 6. Seamless Sign-up Flow

When unauthenticated users try to create a project:

1. Form data is stored in session storage
2. User is redirected to `/sign-up`
3. After sign-up, user returns to homepage
4. Form data is restored and auto-submitted
5. Analysis begins immediately

## Admin Setup

To grant admin access to a user:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Users**
3. Click on the user you want to make admin
4. Go to the **Metadata** tab
5. Under **Public metadata**, add:
   ```json
   {
     "role": "admin"
   }
   ```
6. Save changes

The user will now have access to admin routes.

## Database Schema

The `Project` model includes a `createdBy` field that stores the Clerk user ID:

```prisma
model Project {
  id        String @id @default(cuid())
  createdBy String? // Clerk user ID
  // ... other fields
}
```

This allows for proper user-project association and authorization checks.

## Security Features

### Route Protection

- **Middleware**: `/middleware.ts` handles route-level protection
- **API Auth**: All protected API routes verify user authentication
- **Authorization**: Project routes verify ownership (user can only access their own projects)
- **Admin Check**: Admin routes verify `publicMetadata.role === 'admin'`

### User Data Privacy

- Users can only view/modify their own projects
- Project queries are filtered by `createdBy` field
- Reports remain publicly accessible via secure token

## Auth Helpers

BrandLens provides optimized auth helper functions in `/lib/auth/helpers.ts`:

### `requireAuth()`

Ensures user is authenticated and returns user data:

```typescript
import { requireAuth } from '@/lib/auth/helpers';

export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult; // Auto-returns 401 error
  }

  const { userId, email, isAdmin } = authResult;
  // Your protected code here
}
```

### `requireAdmin()`

Ensures user is authenticated AND has admin role:

```typescript
import { requireAdmin } from '@/lib/auth/helpers';

export async function GET() {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult; // Auto-returns 401 or 403 error
  }

  // Your admin-only code here
}
```

### `verifyOwnership()`

Checks if user owns a resource:

```typescript
import { requireAuth, verifyOwnership } from '@/lib/auth/helpers';

export async function GET(request, { params }) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const project = await prisma.project.findUnique({ where: { id: params.id } });

  const ownershipError = verifyOwnership(authResult, project.createdBy);
  if (ownershipError) return ownershipError; // Auto-returns 403 error

  // User owns this project, proceed
}
```

### `getOptionalAuth()`

Gets auth info without requiring authentication:

```typescript
import { getOptionalAuth } from '@/lib/auth/helpers';

export async function GET() {
  const auth = await getOptionalAuth();

  if (auth) {
    // Personalized response for authenticated users
  } else {
    // Public response
  }
}
```

## Code Examples (Legacy - Use Auth Helpers Instead)

### ~~Protecting an API Route~~ (Deprecated)

**Instead, use `requireAuth()` helper above** ✅

~~```typescript
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your protected code here
}
```~~

### ~~Checking for Admin~~ (Deprecated)

**Instead, use `requireAdmin()` helper above** ✅

~~```typescript
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const isAdmin = user.publicMetadata?.role === 'admin';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Your admin-only code here
}
```~~

### Using User Data in Components

```typescript
import { useUser } from '@clerk/nextjs';

export default function MyComponent() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return <div>Hello, {user.firstName}!</div>;
}
```

## Testing

### Test User Authentication

1. Start the development server: `npm run dev`
2. Navigate to homepage: `http://localhost:3000`
3. Try to create a project without signing in
4. You should be redirected to sign-up
5. Complete sign-up
6. You should return to homepage and analysis should start

### Test Dashboard

1. Sign in to the application
2. Navigate to `/dashboard`
3. You should see your profile and projects list

### Test Admin Access

1. Create a test user
2. Add admin role in Clerk Dashboard
3. Try accessing `/api/admin/stats`
4. You should see system statistics

## Troubleshooting

### "Unauthorized" errors

- Check that `.env.local` has correct Clerk keys
- Verify keys are prefixed correctly (`NEXT_PUBLIC_` for publishable key)
- Restart dev server after adding environment variables

### "Forbidden" errors on admin routes

- Verify user has `role: "admin"` in public metadata
- Check Clerk Dashboard → Users → [User] → Metadata → Public

### Sign-up redirect not working

- Clear browser session storage
- Check browser console for errors
- Verify `forceRedirectUrl="/"` is set in SignUp component

### Projects not showing in dashboard

- Verify user is signed in
- Check browser console for API errors
- Ensure `/api/user/projects` endpoint is working
- Verify `createdBy` field is populated in database

## Next Steps

Potential enhancements for the authentication system:

- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] OAuth providers (Google, GitHub, etc.)
- [ ] Multi-factor authentication
- [ ] Organization/team support
- [ ] Usage limits/quotas per user
- [ ] Subscription/billing integration

## Support

For Clerk-specific issues:

- Documentation: https://clerk.com/docs
- Support: https://clerk.com/support

For BrandLens authentication issues:

- Check this guide first
- Review error logs in browser console
- Check server logs for API errors
