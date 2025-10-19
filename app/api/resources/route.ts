import { NextRequest, NextResponse } from 'next/server';
import { getServerFirestore } from '../_utils/firebaseAdmin';

// GET /api/resources?uid=<uid> - Get user's resources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const collectionId = searchParams.get('collectionId');

    if (!uid) {
      return NextResponse.json(
        { error: 'Missing uid parameter' },
        { status: 400 }
      );
    }

    const db = getServerFirestore();

    let query: FirebaseFirestore.Query = db.collection('resources')
      .where('user_id', '==', uid);

    if (collectionId) {
      query = query.where('collection_ids', 'array-contains', collectionId);
    }

    const resourcesQuery = await query.orderBy('created_at', 'desc').get();

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
    const { user_id, title, link, note, tag, is_public, collection_ids } = await request.json();

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

    const db = getServerFirestore();

    const normalizedCollectionIds: string[] = Array.isArray(collection_ids)
      ? collection_ids.filter((id: unknown): id is string => typeof id === 'string' && id.trim().length > 0)
      : [];

    const resourceRef = db.collection('resources').doc();
    const now = new Date();

    const resourceData = {
      user_id,
      title,
      link,
      note: note || null,
      tag,
      is_public: is_public ?? false,
      collection_ids: normalizedCollectionIds,
      created_at: now,
      updated_at: now,
    };

    await db.runTransaction(async (transaction) => {
      transaction.set(resourceRef, resourceData);

      normalizedCollectionIds.forEach((collectionId: string) => {
        const membershipRef = db
          .collection('users')
          .doc(user_id)
          .collection('collections')
          .doc(collectionId)
          .collection('resources')
          .doc(resourceRef.id);

        transaction.set(membershipRef, {
          resource_id: resourceRef.id,
          added_at: now,
        });
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Resource created successfully',
      resourceId: resourceRef.id
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
    const { id, title, link, note, tag, is_public, collection_ids } = await request.json();

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

    const db = getServerFirestore();
    const resourceRef = db.collection('resources').doc(id);

    const existingSnapshot = await resourceRef.get();
    if (!existingSnapshot.exists) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const existingData = existingSnapshot.data() || {};
    const existingCollectionIds: string[] = Array.isArray(existingData.collection_ids)
      ? existingData.collection_ids
      : [];

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (link !== undefined) updateData.link = link;
    if (note !== undefined) updateData.note = note || null;
    if (tag !== undefined) updateData.tag = tag;
    if (is_public !== undefined) updateData.is_public = is_public;
    updateData.updated_at = new Date();

    let normalizedCollectionIds: string[] | undefined;

    if (collection_ids !== undefined) {
      normalizedCollectionIds = Array.isArray(collection_ids)
        ? collection_ids.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
        : [];
      updateData.collection_ids = normalizedCollectionIds;
    }

    const userId = existingData.user_id;

    await db.runTransaction(async (transaction) => {
      transaction.update(resourceRef, updateData);

      if (normalizedCollectionIds && userId) {
        const toAdd = normalizedCollectionIds.filter((id) => !existingCollectionIds.includes(id));
        const toRemove = existingCollectionIds.filter((id) => !normalizedCollectionIds!.includes(id));

        const now = new Date();

        toAdd.forEach((collectionId) => {
          const membershipRef = db
            .collection('users')
            .doc(userId)
            .collection('collections')
            .doc(collectionId)
            .collection('resources')
            .doc(resourceRef.id);
          transaction.set(membershipRef, {
            resource_id: resourceRef.id,
            added_at: now,
          });
        });

        toRemove.forEach((collectionId) => {
          const membershipRef = db
            .collection('users')
            .doc(userId)
            .collection('collections')
            .doc(collectionId)
            .collection('resources')
            .doc(resourceRef.id);
          transaction.delete(membershipRef);
        });
      }
    });

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

    const db = getServerFirestore();
    const resourceRef = db.collection('resources').doc(id);
    const snapshot = await resourceRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const data = snapshot.data() || {};
    const userId: string | undefined = data.user_id;
    const collectionIds: string[] = Array.isArray(data.collection_ids) ? data.collection_ids : [];

    await db.runTransaction(async (transaction) => {
      if (userId && collectionIds.length > 0) {
        collectionIds.forEach((collectionId) => {
          const membershipRef = db
            .collection('users')
            .doc(userId)
            .collection('collections')
            .doc(collectionId)
            .collection('resources')
            .doc(id);
          transaction.delete(membershipRef);
        });
      }

      transaction.delete(resourceRef);
    });

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