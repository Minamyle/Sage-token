import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/data';

// Helper function to check admin auth
function isAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  return authHeader && authHeader.includes('admin');
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required'
          }
        },
        { status: 403 }
      );
    }

    // Return users without passwords
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json({
      success: true,
      users: usersWithoutPasswords
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