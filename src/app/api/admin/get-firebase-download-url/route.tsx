import { NextResponse } from "next/server";
import admin from "firebase-admin";

export async function POST(request: Request) {
    const { fileName } = await request.json();
    
    try {
        // Initialize Firebase Admin if not already initialized
        if (admin.apps.length === 0) {
            const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
            
            if (!serviceAccount) {
                return NextResponse.json(
                    { error: "Firebase service account not configured" },
                    { status: 500 }
                );
            }

            const parsedServiceAccount = JSON.parse(serviceAccount);
            admin.initializeApp({
                credential: admin.credential.cert(parsedServiceAccount),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        }

        const bucket = admin.storage().bucket();
        const file = bucket.file(fileName);

        // Make the file publicly accessible (optional, or use signed URLs)
        await file.makePublic();

        // Get the public URL
        const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;

        return NextResponse.json({
            downloadUrl,
        });
    } catch (error) {
        console.error("Error getting Firebase Storage download URL:", error);
        
        // If makePublic fails, try to get a signed URL instead
        try {
            const bucket = admin.storage().bucket();
            const file = bucket.file(fileName);
            
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
            });

            return NextResponse.json({
                downloadUrl: signedUrl,
            });
        } catch (signedError) {
            return NextResponse.json(
                { 
                    error: "Error getting download URL",
                    details: error instanceof Error ? error.message : "Unknown error"
                },
                { status: 500 }
            );
        }
    }
}
