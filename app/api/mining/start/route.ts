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

    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Task ID is required'
          }
        },
        { status: 400 }
      );
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found'
          }
        },
        { status: 404 }
      );
    }

    // Check if user already has an active session for this task
    const existingSession = miningSessions.find(
      s => s.userId === user.id && s.taskId === taskId && s.isActive
    );

    if (existingSession) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SESSION_EXISTS',
            message: 'Mining session already active for this task'
          }
        },
        { status: 409 }
      );
    }

    const session = {
      id: Date.now().toString(),
      userId: user.id,
      taskId,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + (task.timeframe || 4) * 60 * 1000).toISOString(),
      reward: task.reward,
      isActive: true,
      boosted: false
    };

    miningSessions.push(session);

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