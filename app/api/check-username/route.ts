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

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    // Validate input
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { available: false, error: 'Invalid username' },
        { status: 400 }
      );
    }

    // Check format (server-side validation)
    const usernameRegex = /^[a-z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({
        available: false,
        error: 'Username must be 3-20 characters, lowercase letters, numbers, underscores, or hyphens only.'
      });
    }

    // Initialize Firebase Admin and query Firestore securely
    const firestoreDb = initializeFirebaseAdmin();
    const usersRef = firestoreDb.collection('users');
    const snapshot = await usersRef
      .where('username', '==', username)
      .limit(1)
      .get();

    const available = snapshot.empty;

    return NextResponse.json({ available });
  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { available: false, error: 'Server error' },
      { status: 500 }
    );
  }
}