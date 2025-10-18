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

// GET /api/public-resources?userId=<userId> - Get public resources from other users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const db = initializeFirebaseAdmin();

    // Get all public resources except current user's
    const publicResourcesQuery = await db.collection('resources')
      .where('is_public', '==', true)
      .where('user_id', '!=', userId)
      .orderBy('user_id')
      .orderBy('created_at', 'desc')
      .get();

    const resources = publicResourcesQuery.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      resources
    });

  } catch (error) {
    console.error('Error fetching public resources:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/public-resources - Save a public resource to user's collection
export async function POST(request: NextRequest) {
  try {
    const { userId, resourceId } = await request.json();

    // Validate required fields
    if (!userId || !resourceId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, resourceId' },
        { status: 400 }
      );
    }

    const db = initializeFirebaseAdmin();

    // Get the original public resource
    const originalResource = await db.collection('resources').doc(resourceId).get();

    if (!originalResource.exists) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    const resourceData = originalResource.data();

    // Check if user already has this resource saved (by link)
    const existingResourceQuery = await db.collection('resources')
      .where('user_id', '==', userId)
      .where('link', '==', resourceData.link)
      .get();

    if (!existingResourceQuery.empty) {
      return NextResponse.json(
        { error: 'You already have this resource saved' },
        { status: 409 }
      );
    }

    // Save the resource to user's collection
    const newResourceData = {
      user_id: userId,
      title: resourceData.title,
      link: resourceData.link,
      note: resourceData.note,
      tag: resourceData.tag,
      is_public: false, // Always save as private
      created_at: new Date(),
    };

    await db.collection('resources').add(newResourceData);

    return NextResponse.json({
      success: true,
      message: 'Resource saved to your collection'
    });

  } catch (error) {
    console.error('Error saving public resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}