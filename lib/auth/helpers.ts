import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Auth helper utilities for API routes
 * Provides consistent auth checks, error handling, and user data access
 */

export interface AuthResult {
  userId: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Get authenticated user or return 401 error
 * Use this for routes that require authentication
 */
export async function requireAuth(): Promise<AuthResult | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  // Get user details from Clerk
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress;

  if (!email) {
    return NextResponse.json(
      { error: 'Invalid account', message: 'No email address found' },
      { status: 400 }
    );
  }

  const isAdmin = user.publicMetadata?.role === 'admin';

  return {
    userId,
    email,
    isAdmin,
  };
}

/**
 * Get authenticated admin user or return 403 error
 * Use this for routes that require admin privileges
 */
export async function requireAdmin(): Promise<AuthResult | NextResponse> {
  const authResult = await requireAuth();

  // If already an error response, return it
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // Check admin status
  if (!authResult.isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Admin access required' },
      { status: 403 }
    );
  }

  return authResult;
}

/**
 * Get optional auth info (doesn't fail if not authenticated)
 * Use this for routes that work with or without auth
 */
export async function getOptionalAuth(): Promise<AuthResult | null> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (!email) {
      return null;
    }

    return {
      userId,
      email,
      isAdmin: user.publicMetadata?.role === 'admin',
    };
  } catch (error) {
    console.error('[Auth] Error getting optional auth:', error);
    return null;
  }
}

/**
 * Verify user owns a resource
 * Returns 403 if user doesn't own the resource
 */
export function verifyOwnership(
  authResult: AuthResult,
  resourceOwnerId: string | null | undefined
): NextResponse | null {
  if (!resourceOwnerId) {
    return NextResponse.json(
      { error: 'Invalid resource', message: 'Resource has no owner' },
      { status: 500 }
    );
  }

  if (authResult.userId !== resourceOwnerId && !authResult.isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'You do not have access to this resource' },
      { status: 403 }
    );
  }

  return null; // No error
}

/**
 * Check if current user is admin
 * Simple boolean check for conditional logic
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.publicMetadata?.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Get current user ID without full auth check
 * Returns null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId || null;
  } catch {
    return null;
  }
}
