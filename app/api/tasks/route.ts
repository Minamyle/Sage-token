import { NextRequest, NextResponse } from 'next/server';
import { tasks, users } from '@/lib/data';

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
  return userId;
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
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

    return NextResponse.json({
      success: true,
      tasks
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
    // Check if admin (simplified - in production use proper admin auth)
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

    const {
      title,
      description,
      reward,
      difficulty,
      type,
      timeframe,
      socialLink,
      youtubeUrl,
      articleUrl,
      twitterHandle
    } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Title and description are required'
          }
        },
        { status: 400 }
      );
    }

    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      reward: reward || 500,
      difficulty: difficulty || 'medium',
      type: type || 'mining',
      timeframe: timeframe || 4,
      completedBy: [],
      socialLink: type === 'social' ? socialLink : null,
      youtubeUrl: type === 'youtube' ? youtubeUrl : null,
      articleUrl: type === 'article' ? articleUrl : null,
      twitterHandle: type === 'twitter' ? twitterHandle : null,
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);

    return NextResponse.json({
      success: true,
      task: newTask
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