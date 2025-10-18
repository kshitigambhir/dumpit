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

// GET /api/resources?uid=<uid> - Get user's resources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { error: 'Missing uid parameter' },
        { status: 400 }
      );
    }

    const db = initializeFirebaseAdmin();

    const resourcesQuery = await db.collection('resources')
      .where('user_id', '==', uid)
      .orderBy('created_at', 'desc')
      .get();

    const resources = resourcesQuery.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      resources
    });

  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/resources - Create new resource
export async function POST(request: NextRequest) {
  try {
    const { user_id, title, link, note, tag, is_public } = await request.json();

    // Validate required fields
    if (!user_id || !title || !link || !tag) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, title, link, tag' },
        { status: 400 }
      );
    }

    // Validate link format
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Link must start with http:// or https://' },
        { status: 400 }
      );
    }

    const db = initializeFirebaseAdmin();

    const resourceData = {
      user_id,
      title,
      link,
      note: note || null,
      tag,
      is_public: is_public ?? false,
      created_at: new Date(),
    };

    const docRef = await db.collection('resources').add(resourceData);

    return NextResponse.json({
      success: true,
      message: 'Resource created successfully',
      resourceId: docRef.id
    });

  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/resources - Update resource
export async function PUT(request: NextRequest) {
  try {
    const { id, title, link, note, tag, is_public } = await request.json();

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // Validate link format if provided
    if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Link must start with http:// or https://' },
        { status: 400 }
      );
    }

    const db = initializeFirebaseAdmin();

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (link !== undefined) updateData.link = link;
    if (note !== undefined) updateData.note = note || null;
    if (tag !== undefined) updateData.tag = tag;
    if (is_public !== undefined) updateData.is_public = is_public;

    await db.collection('resources').doc(id).update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Resource updated successfully'
    });

  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/resources?id=<resourceId> - Delete resource
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    const db = initializeFirebaseAdmin();

    await db.collection('resources').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}