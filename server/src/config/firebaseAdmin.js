import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { applicationDefault, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function hasApplicationDefaultCredentials() {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credentialsPath) {
    if (!existsSync(credentialsPath)) {
      throw new Error("O arquivo indicado por GOOGLE_APPLICATION_CREDENTIALS não existe.");
    }
    return true;
  }

  const cloudSdkConfig = process.env.CLOUDSDK_CONFIG
    || (process.platform === "win32" ? join(process.env.APPDATA || homedir(), "gcloud") : join(homedir(), ".config", "gcloud"));
  const defaultCredentialsPath = join(cloudSdkConfig, "application_default_credentials.json");
  const managedCloudRuntime = Boolean(
    process.env.K_SERVICE || process.env.GAE_ENV || process.env.FUNCTION_TARGET ||
    process.env.GCE_METADATA_HOST || process.env.GCE_METADATA_IP
  );
  return existsSync(defaultCredentialsPath) || managedCloudRuntime;
}

function initializeFirebase() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const emulatorEnabled = Boolean(
    process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST
  );
  const credentialsAvailable = Boolean(serviceAccountJson || hasApplicationDefaultCredentials());

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
