import { NextRequest, NextResponse } from 'next/server';
import { withdrawals } from '@/lib/data';

// Helper function to check admin auth
function isAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  return authHeader && authHeader.includes('admin');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { withdrawalId: string } }
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

    const withdrawalId = params.withdrawalId;
    const { status } = await request.json();

    if (!status || !['completed', 'pending'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid status is required'
          }
        },
        { status: 400 }
      );
    }

    const withdrawalIndex = withdrawals.findIndex(w => w.id === withdrawalId);

    if (withdrawalIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WITHDRAWAL_NOT_FOUND',
            message: 'Withdrawal not found'
          }
        },
        { status: 404 }
      );
    }

    withdrawals[withdrawalIndex].status = status;

    return NextResponse.json({
      success: true,
      withdrawal: withdrawals[withdrawalIndex]
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