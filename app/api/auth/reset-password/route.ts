import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and new password are required'
          }
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Password must be at least 6 characters long'
          }
        },
        { status: 400 }
      );
    }

    // Find user by email
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        },
        { status: 404 }
      );
    }

    // Update password
    users[userIndex].password = newPassword;

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
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