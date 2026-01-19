import { NextRequest, NextResponse } from 'next/server';
import { adminSettings } from '@/lib/data';

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

    return NextResponse.json({
      success: true,
      settings: adminSettings
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

    const updates = await request.json();

    // Update settings
    Object.assign(adminSettings, updates);

    return NextResponse.json({
      success: true,
      settings: adminSettings
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