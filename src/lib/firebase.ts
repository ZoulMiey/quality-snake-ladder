import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, connectAuthEmulator, type User } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator, ref, onValue } from "firebase/database";

// These web settings are not secret. The database rules (database.rules.json) protect the data.
const firebaseConfig = {
  apiKey: "AIzaSyAforKlnTXMAtx6b8AbeD51NksR2g4xDyg",
  authDomain: "quality-snake-ladder.firebaseapp.com",
  databaseURL: "https://quality-snake-ladder-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quality-snake-ladder",
  storageBucket: "quality-snake-ladder.firebasestorage.app",
  messagingSenderId: "706421495884",
  appId: "1:706421495884:web:c4d0e401f67c69845cfce9",
};

const useEmulator = import.meta.env.VITE_USE_EMULATOR === "true";

export const app = initializeApp(
  useEmulator
    ? { ...firebaseConfig, projectId: "demo-qsl", databaseURL: "http://127.0.0.1:9000?ns=demo-qsl-default-rtdb" }
    : firebaseConfig,
);
export const auth = getAuth(app);
export const db = getDatabase(app);

if (useEmulator) {
  const host = location.hostname;
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectDatabaseEmulator(db, host, 9000);
}

/** Signs in without a password (a hidden, per-browser login) and resolves with the user. Signs in only once per device. */
let signingIn: Promise<User> | null = null;
export function ensureSignedIn(): Promise<User> {
  signingIn ??= (async () => {
    await auth.authStateReady();
    return auth.currentUser ?? (await signInAnonymously(auth)).user;
  })();
  signingIn.catch(() => (signingIn = null));
  return signingIn;
}

/** Difference between this device's clock and the server clock, kept up to date. */
let offset = 0;
onValue(ref(db, ".info/serverTimeOffset"), (s) => {
  offset = Number(s.val()) || 0;
});
export const serverNow = () => Date.now() + offset;
