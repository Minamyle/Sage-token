import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email is required'
          }
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'No account found with this email address'
          }
        },
        { status: 404 }
      );
    }

    // In production, generate a reset token and send email
    // For demo, we'll just return success
    console.log(`[EMAIL SENT] Password reset requested for: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent'
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