import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/data';

// Helper function to get user from token
function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer '
  const tokenParts = token.split('_');
  if (tokenParts.length < 2 || tokenParts[0] !== 'jwt') {
    return null;
  }

  const userId = tokenParts[1];
  return users.find(u => u.id === userId) || null;
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token'
          }
        },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Current password and new password are required'
          }
        },
        { status: 400 }
      );
    }

    if (user.password !== currentPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Current password is incorrect'
          }
        },
        { status: 401 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'New password must be at least 6 characters long'
          }
        },
        { status: 400 }
      );
    }

    // Update password
    user.password = newPassword;

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error'
        }
      },
      { status: 500 }
    );
  }
}