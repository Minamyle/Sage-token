import { NextRequest, NextResponse } from 'next/server';
import { users, tasks, withdrawals } from '@/lib/data';

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

    const totalTasks = tasks.length;
    const totalUsers = users.length;
    const totalTokensDistributed = users.reduce((sum, u) => sum + u.totalEarned, 0);
    const avgTaskReward = tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.reward, 0) / tasks.length) : 0;
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

    return NextResponse.json({
      success: true,
      stats: {
        totalTasks,
        totalUsers,
        totalTokensDistributed,
        avgTaskReward,
        pendingWithdrawals
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