import { applicationDefault, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function initializeFirebase() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const emulatorEnabled = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  const credentialsAvailable = Boolean(serviceAccountJson || process.env.GOOGLE_APPLICATION_CREDENTIALS);

  if (!credentialsAvailable && !emulatorEnabled) return null;

  const options = {};
  if (projectId) options.projectId = projectId;

  if (serviceAccountJson) {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (error) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON deve conter um JSON válido.", { cause: error });
    }
    options.credential = cert(serviceAccount);
  } else if (credentialsAvailable) {
    options.credential = applicationDefault();
  } else {
    options.projectId ||= "demo-monezy-b2b";
  }

  return getApps().length ? getApp() : initializeApp(options);
}

export const firebaseAdminApp = initializeFirebase();
export const firebaseAdminConfigured = Boolean(firebaseAdminApp);
export const adminAuth = firebaseAdminApp ? getAuth(firebaseAdminApp) : null;
export const adminDb = firebaseAdminApp ? getFirestore(firebaseAdminApp) : null;
