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

export async function GET(request: NextRequest) {
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

    // Return user data without password
    const { password, ...userProfile } = user;

    return NextResponse.json({
      success: true,
      user: userProfile
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

    const { fullName, walletId } = await request.json();

    // Update user data
    if (fullName) user.fullName = fullName;
    if (walletId) user.walletId = walletId;

    // Return updated user data without password
    const { password, ...userProfile } = user;

    return NextResponse.json({
      success: true,
      user: userProfile
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