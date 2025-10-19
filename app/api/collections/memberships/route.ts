import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getServerFirestore } from '../../_utils/firebaseAdmin';

const COLLECTION_SUBPATH = 'collections';

export async function POST(request: NextRequest) {
  try {
    const { uid, collectionId, resourceId } = await request.json();

    if (!uid || !collectionId || !resourceId) {
      return NextResponse.json({ error: 'Missing required fields: uid, collectionId, resourceId' }, { status: 400 });
    }

    const db = getServerFirestore();
    const collectionDoc = db.collection('users').doc(uid).collection(COLLECTION_SUBPATH).doc(collectionId);
    const resourceDoc = db.collection('resources').doc(resourceId);

    const snapshot = await collectionDoc.get();
    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    await db.runTransaction(async (transaction) => {
      const membershipRef = collectionDoc.collection('resources').doc(resourceId);
      transaction.set(membershipRef, {
        resource_id: resourceId,
        added_at: new Date(),
      });

      transaction.set(resourceDoc, {
        collection_ids: FieldValue.arrayUnion(collectionId),
        updated_at: new Date(),
      }, { merge: true });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding resource to collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const collectionId = searchParams.get('collectionId');
    const resourceId = searchParams.get('resourceId');

    if (!uid || !collectionId || !resourceId) {
      return NextResponse.json({ error: 'Missing uid, collectionId, or resourceId' }, { status: 400 });
    }

    const db = getServerFirestore();
    const collectionDoc = db.collection('users').doc(uid).collection(COLLECTION_SUBPATH).doc(collectionId);
    const resourceDoc = db.collection('resources').doc(resourceId);

    await db.runTransaction(async (transaction) => {
      const membershipRef = collectionDoc.collection('resources').doc(resourceId);
      transaction.delete(membershipRef);
      transaction.set(resourceDoc, {
        collection_ids: FieldValue.arrayRemove(collectionId),
        updated_at: new Date(),
      }, { merge: true });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing resource from collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
