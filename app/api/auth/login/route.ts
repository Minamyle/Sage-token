import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required'
          }
        },
        { status: 400 }
      );
    }

    // Find user
    const user = users.find(u => u.email === email);

    if (!user || user.password !== password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        },
        { status: 401 }
      );
    }

    // Create JWT token (simplified - in production use proper JWT library)
    const token = `jwt_${user.id}_${Date.now()}`;

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
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