import { NextRequest, NextResponse } from 'next/server';
import { users, withdrawals } from '@/lib/data';

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

    const userWithdrawals = withdrawals.filter(w => w.email === user.email);

    return NextResponse.json({
      success: true,
      withdrawals: userWithdrawals
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

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid amount is required'
          }
        },
        { status: 400 }
      );
    }

    // Check minimum withdrawal (hardcoded for demo)
    const minWithdrawal = 100;
    if (amount < minWithdrawal) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MINIMUM_WITHDRAWAL',
            message: `Minimum withdrawal amount is ${minWithdrawal} ST`
          }
        },
        { status: 400 }
      );
    }

    if (amount > user.tokenBalance) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_BALANCE',
            message: 'Insufficient token balance'
          }
        },
        { status: 409 }
      );
    }

    const withdrawal = {
      id: Date.now().toString(),
      email: user.email,
      amount,
      walletId: user.walletId,
      status: 'pending' as const,
      timestamp: Date.now()
    };

    withdrawals.push(withdrawal);

    // Deduct from user balance
    user.tokenBalance -= amount;

    return NextResponse.json({
      success: true,
      withdrawal
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