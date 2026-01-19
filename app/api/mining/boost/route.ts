import { NextRequest, NextResponse } from 'next/server';
import { users, miningSessions } from '@/lib/data';

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

export async function POST(request: NextRequest) {
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

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Session ID is required'
          }
        },
        { status: 400 }
      );
    }

    const sessionIndex = miningSessions.findIndex(
      s => s.id === sessionId && s.userId === user.id && s.isActive
    );

    if (sessionIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Active mining session not found'
          }
        },
        { status: 404 }
      );
    }

    const session = miningSessions[sessionIndex];

    if (session.boosted) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_BOOSTED',
            message: 'Session already boosted'
          }
        },
        { status: 409 }
      );
    }

    // Apply boost (50% increase)
    session.reward = Math.floor(session.reward * 1.5);
    session.boosted = true;

    return NextResponse.json({
      success: true,
      session
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