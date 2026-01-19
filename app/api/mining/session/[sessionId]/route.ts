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

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
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

    const sessionId = params.sessionId;
    const session = miningSessions.find(
      s => s.id === sessionId && s.userId === user.id
    );

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Mining session not found'
          }
        },
        { status: 404 }
      );
    }

    const now = new Date();
    const endTime = new Date(session.endTime);
    const timeRemaining = Math.max(0, endTime.getTime() - now.getTime());

    return NextResponse.json({
      success: true,
      session: {
        ...session,
        timeRemaining: Math.floor(timeRemaining / 1000) // seconds
      }
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