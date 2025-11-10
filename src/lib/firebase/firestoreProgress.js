import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

// Firestore is already initialized in your firebaseClient.js
const db = firebase.firestore();

const COLLECTION_NAME = "career_progress";

/**
 * Save form progress to Firestore
 */
export async function saveFormProgress(userId, careerKey, progressData) {
  try {
    const docId = `${userId}_${careerKey}`;
    const docRef = db.collection(COLLECTION_NAME).doc(docId);

    // Check if document exists to preserve createdAt
    const existingDoc = await docRef.get();

    const data = {
      userId,
      careerKey,
      currentSegment: progressData.currentSegment,
      completedSegments: progressData.completedSegments,
      formData: progressData.formData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    // Only set createdAt if document doesn't exist
    if (!existingDoc.exists) {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }

    await docRef.set(data, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error saving form progress:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Load form progress from Firestore
 */
export async function loadFormProgress(userId, careerKey) {
  try {
    const docId = `${userId}_${careerKey}`;
    const docRef = db.collection(COLLECTION_NAME).doc(docId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();

      // Check if progress is expired (7 days)
      if (data.createdAt) {
        const createdDate = data.createdAt.toDate();
        const daysSince = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSince > 7) {
          // Auto-delete expired progress
          await docRef.delete();
          return { success: true, data: null };
        }
      }

      return { success: true, data };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error("Error loading form progress:", error);
    return { success: false, error: error.message, data: null };
  }
}

/**
 * Clear form progress from Firestore
 */
export async function clearFormProgress(userId, careerKey) {
  try {
    const docId = `${userId}_${careerKey}`;
    const docRef = db.collection(COLLECTION_NAME).doc(docId);
    await docRef.delete();
    return { success: true };
  } catch (error) {
    console.error("Error clearing form progress:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all progress for a user (useful for showing saved drafts)
 */
export async function getAllUserProgress(userId) {
  try {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where("userId", "==", userId)
      .orderBy("updatedAt", "desc")
      .get();

    const progressList = [];
    snapshot.forEach((doc) => {
      progressList.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: progressList };
  } catch (error) {
    console.error("Error getting all user progress:", error);
    return { success: false, error: error.message, data: [] };
  }
}