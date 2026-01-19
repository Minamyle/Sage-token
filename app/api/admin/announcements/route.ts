import { NextRequest, NextResponse } from 'next/server';
import { announcements } from '@/lib/data';

// Helper function to check admin auth
function isAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  return authHeader && authHeader.includes('admin');
}

export async function POST(request: NextRequest) {
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

    const { title, message } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Title and message are required'
          }
        },
        { status: 400 }
      );
    }

    const announcement = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: Date.now(),
      active: true
    };

    announcements.push(announcement);

    return NextResponse.json({
      success: true,
      announcement
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