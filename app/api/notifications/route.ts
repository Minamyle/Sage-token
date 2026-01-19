import { NextRequest, NextResponse } from 'next/server';
import { users, notifications } from '@/lib/data';

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

    const userNotifications = notifications
      .filter(n => n.email === user.email)
      .sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      success: true,
      notifications: userNotifications
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

    const { userId, type, title, message } = await request.json();

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

    const notification: any = {
      id: Date.now().toString(),
      type: type || 'admin',
      title,
      message,
      read: false,
      timestamp: Date.now()
    };

    if (userId) {
      // Send to specific user
      const user = users.find(u => u.id === userId);
      if (user) {
        notification.email = user.email;
        notifications.push(notification);
      }
    } else {
      // Send to all users
      users.forEach(user => {
        notifications.push({
          ...notification,
          email: user.email
        });
      });
    }

    return NextResponse.json({
      success: true,
      notification
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