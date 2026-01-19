import { NextRequest, NextResponse } from 'next/server';
import { users, tasks, miningSessions } from '@/lib/data';

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

    // Check if session is actually completed
    const now = new Date();
    const endTime = new Date(session.endTime);

    if (now < endTime) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SESSION_NOT_COMPLETE',
            message: 'Mining session is not yet complete'
          }
        },
        { status: 409 }
      );
    }

    // Complete the session
    session.isActive = false;
    user.tokenBalance += session.reward;
    user.totalEarned += session.reward;
    user.tasksCompleted += 1;

    // Mark task as completed by user
    const task = tasks.find(t => t.id === session.taskId);
    if (task && !task.completedBy.includes(user.id)) {
      task.completedBy.push(user.id);
    }

    return NextResponse.json({
      success: true,
      reward: session.reward,
      newBalance: user.tokenBalance
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