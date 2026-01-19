import { NextRequest, NextResponse } from 'next/server';
import { users, referrals } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, walletId, referralCode } = await request.json();

    if (!fullName || !email || !password || !walletId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'All fields are required'
          }
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Password must be at least 8 characters'
          }
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          }
        },
        { status: 409 }
      );
    }

    // Generate referral code
    const referralCodeGenerated = `SAGE-${fullName.split(' ')[0].toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      password, // In production, hash this password
      walletId,
      tokenBalance: 0,
      tasksCompleted: 0,
      totalEarned: 0,
      joinedDate: new Date().toISOString(),
      referralCode: referralCodeGenerated
    };

    users.push(newUser);

    // Handle referral
    if (referralCode) {
      const referrer = users.find(u => u.referralCode === referralCode);
      if (referrer) {
        const referralData = {
          id: Date.now().toString(),
          referrerId: referrer.id,
          referrerEmail: referrer.email,
          referredEmail: email,
          referredName: fullName,
          status: 'pending' as const,
          rewardAmount: 100,
          timestamp: Date.now()
        };
        referrals.push(referralData);
      }
    }

    // Create JWT token (simplified)
    const token = `jwt_${newUser.id}_${Date.now()}`;

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
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