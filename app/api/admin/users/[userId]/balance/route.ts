import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/data';

// Helper function to check admin auth
function isAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  return authHeader && authHeader.includes('admin');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const userId = params.userId;
    const { newBalance } = await request.json();

    if (newBalance === undefined || newBalance < 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid new balance is required'
          }
        },
        { status: 400 }
      );
    }

    const userIndex = users.findIndex(u => u.id === userId);

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

    users[userIndex].tokenBalance = newBalance;
    users[userIndex].totalEarned = newBalance;

    const { password, ...userWithoutPassword } = users[userIndex];

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
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