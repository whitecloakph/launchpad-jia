import admin from "firebase-admin";

export default async function backendAuthCheck(idToken) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccount) {
    let error = {
      error: "[Auth] - Config Error - Service Account data not provided.",
    };

    console.error(error);

    return false;
  }

  if (!idToken) {
    return { error: "AuthToken not provided." };
  }

  if (admin.apps.length === 0) {
    let parseServivceAccount = JSON.parse(serviceAccount);
    admin.initializeApp({
      credential: admin.credential.cert(parseServivceAccount),
    });
  }

  async function verifyFirebaseToken(authToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(authToken);
      console.log("Token verified successfully:", decodedToken);
      return decodedToken;
    } catch (error) {
      console.error("Error verifying token:", error);
      return false;
    }
  }

  let results = await verifyFirebaseToken(idToken);

  return results;
}
