import { NextRequest, NextResponse } from 'next/server';

// Admin credentials (in production, use proper authentication)
const ADMIN_PASSWORD = 'SageAdmin2025!';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Password is required'
          }
        },
        { status: 400 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid admin password'
          }
        },
        { status: 401 }
      );
    }

    // Create admin JWT token
    const token = `admin_jwt_${Date.now()}`;

    return NextResponse.json({
      success: true,
      token
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