import { NextRequest, NextResponse } from 'next/server';
import { tasks } from '@/lib/data';

export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    // Check if admin (simplified)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('admin')) {
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

    const taskId = params.taskId;
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
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

    const updates = await request.json();
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };

    return NextResponse.json({
      success: true,
      task: tasks[taskIndex]
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    // Check if admin (simplified)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('admin')) {
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

    const taskId = params.taskId;
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
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

    tasks.splice(taskIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
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