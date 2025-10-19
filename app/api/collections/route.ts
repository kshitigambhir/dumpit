import { NextRequest, NextResponse } from 'next/server';
import { getServerFirestore } from '../_utils/firebaseAdmin';

const COLLECTION_SUBPATH = 'collections';

const buildCollectionData = (raw: any) => ({
  id: raw.id,
  name: raw.name,
  description: raw.description || '',
  icon: raw.icon || null,
  color: raw.color || null,
  is_shared: Boolean(raw.is_shared),
  sort_order: typeof raw.sort_order === 'number' ? raw.sort_order : null,
  created_at: raw.created_at || null,
  updated_at: raw.updated_at || null,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const sharedOnly = searchParams.get('shared') === 'true';

    const db = getServerFirestore();

    if (sharedOnly) {
      const snapshot = await db
        .collectionGroup(COLLECTION_SUBPATH)
        .where('is_shared', '==', true)
        .orderBy('sort_order', 'asc')
        .get();

      const collections = snapshot.docs.map((doc) => (
        buildCollectionData({ id: doc.id, ...doc.data() })
      ));

      return NextResponse.json({ success: true, collections });
    }

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid parameter' }, { status: 400 });
    }

    const collectionsRef = db.collection('users').doc(uid).collection(COLLECTION_SUBPATH);
    const snapshot = await collectionsRef.orderBy('sort_order', 'asc').get();

    const collections = snapshot.docs.map((doc) => (
      buildCollectionData({ id: doc.id, ...doc.data() })
    ));

    return NextResponse.json({ success: true, collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { uid, name, description, icon, color, is_shared, sort_order } = await request.json();

    if (!uid || !name) {
      return NextResponse.json({ error: 'Missing required fields: uid, name' }, { status: 400 });
    }

    const db = getServerFirestore();
    const collectionsRef = db.collection('users').doc(uid).collection(COLLECTION_SUBPATH);
    const now = new Date();

    const docRef = collectionsRef.doc();
    const collectionData = {
      name,
      description: description || '',
      icon: icon || null,
      color: color || null,
      is_shared: Boolean(is_shared),
      sort_order: typeof sort_order === 'number' ? sort_order : Date.now(),
      created_at: now,
      updated_at: now,
    };

    await docRef.set(collectionData);

    return NextResponse.json({
      success: true,
      collection: buildCollectionData({ id: docRef.id, ...collectionData }),
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { uid, collectionId, name, description, icon, color, is_shared, sort_order } = await request.json();

    if (!uid || !collectionId) {
      return NextResponse.json({ error: 'Missing required fields: uid, collectionId' }, { status: 400 });
    }

    const db = getServerFirestore();
    const docRef = db.collection('users').doc(uid).collection(COLLECTION_SUBPATH).doc(collectionId);

    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };

    if (typeof name === 'string') updateData.name = name;
    if (typeof description === 'string') updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (typeof is_shared === 'boolean') updateData.is_shared = is_shared;
    if (typeof sort_order === 'number') updateData.sort_order = sort_order;

    await docRef.set(updateData, { merge: true });

    const updatedDoc = await docRef.get();

    return NextResponse.json({
      success: true,
      collection: buildCollectionData({ id: updatedDoc.id, ...updatedDoc.data() })
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const collectionId = searchParams.get('collectionId');

    if (!uid || !collectionId) {
      return NextResponse.json({ error: 'Missing uid or collectionId parameter' }, { status: 400 });
    }

    const db = getServerFirestore();
    const docRef = db.collection('users').doc(uid).collection(COLLECTION_SUBPATH).doc(collectionId);
    const resourcesSnapshot = await docRef.collection('resources').get();

    const batch = db.batch();

    resourcesSnapshot.forEach((resourceDoc) => {
      batch.delete(resourceDoc.ref);
    });

    batch.delete(docRef);

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
