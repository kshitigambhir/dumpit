import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Lazy initialization of Firebase Admin
let db: any = null;

const initializeFirebaseAdmin = () => {
  if (!db) {
    if (!getApps().length) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        throw new Error('Missing Firebase Admin SDK environment variables');
      }

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }
    db = getFirestore();
  }
  return db;
};

// POST /api/user-profile - Create or update user profile
export async function POST(request: NextRequest) {
  try {
    const { uid, username, email, share_by_default } = await request.json();

    // Validate required fields
    if (!uid || !username || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: uid, username, email' },
        { status: 400 }
      );
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({
        error: 'Username must be 3-20 characters, lowercase letters, numbers, underscores, or hyphens only.'
      }, { status: 400 });
    }

    const db = initializeFirebaseAdmin();

    // Check if username is already taken by another user
    const usernameQuery = await db.collection('users')
      .where('username', '==', username)
      .where('id', '!=', uid)
      .get();

    if (!usernameQuery.empty) {
      return NextResponse.json({
        error: 'Username is already taken'
      }, { status: 409 });
    }

    // Create or update user profile
    const userData = {
      id: uid,
      username,
      email,
      share_by_default: share_by_default ?? false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.collection('users').doc(uid).set(userData, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'User profile created/updated successfully'
    });

  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/user-profile?uid=<uid>&type=<profile|stats> - Get user profile or stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const type = searchParams.get('type'); // 'stats' or 'profile'

    if (!uid) {
      return NextResponse.json(
        { error: 'Missing uid parameter' },
        { status: 400 }
      );
    }

    const db = initializeFirebaseAdmin();

    if (type === 'stats') {
      // Get user resource statistics
      const resourcesQuery = await db.collection('resources')
        .where('user_id', '==', uid)
        .get();

      const allResources = resourcesQuery.docs.map((doc: any) => doc.data());
      const publicCount = allResources.filter((r: any) => r.is_public).length;

      return NextResponse.json({
        success: true,
        stats: {
          total: allResources.length,
          public: publicCount,
          private: allResources.length - publicCount
        }
      });
    } else {
      // Get user profile (default behavior)
      const userDoc = await db.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        );
      }

      const userData = userDoc.data();

      return NextResponse.json({
        success: true,
        profile: userData
      });
    }

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user-profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { uid, username, share_by_default } = await request.json();

    // Validate required fields
    if (!uid) {
      return NextResponse.json(
        { error: 'Missing required field: uid' },
        { status: 400 }
      );
    }

    // Validate username format if provided
    if (username) {
      const usernameRegex = /^[a-z0-9_-]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return NextResponse.json({
          error: 'Username must be 3-20 characters, lowercase letters, numbers, underscores, or hyphens only.'
        }, { status: 400 });
      }
    }

    const db = initializeFirebaseAdmin();

    // Check if username is already taken by another user (if updating username)
    if (username) {
      const usernameQuery = await db.collection('users')
        .where('username', '==', username)
        .where('id', '!=', uid)
        .get();

      if (!usernameQuery.empty) {
        return NextResponse.json({
          error: 'Username is already taken'
        }, { status: 409 });
      }
    }

    // Update user profile
    const updateData: any = {
      updated_at: new Date(),
    };

    if (username !== undefined) updateData.username = username;
    if (share_by_default !== undefined) updateData.share_by_default = share_by_default;

    await db.collection('users').doc(uid).update(updateData);

    return NextResponse.json({
      success: true,
      message: 'User profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}