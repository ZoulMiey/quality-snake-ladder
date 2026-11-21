// The player in the Quality Games app: a nickname (always), and optionally a Google sign-in so their scores go
// on the high score lists. Nothing from the Google account is shown or stored: only the nickname.
import { GoogleAuthProvider, linkWithPopup, linkWithRedirect, signInAnonymously, signInWithCredential, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, ensureSignedIn } from "../lib/firebase.ts";

export function getNick(): string {
  try {
    return localStorage.getItem("qsl-name") ?? "";
  } catch {
    return "";
  }
}
export function setNick(n: string) {
  try {
    localStorage.setItem("qsl-name", n.trim().replace(/\s+/g, " ").slice(0, 20));
  } catch {}
}

/** Popups can be blocked (some phones, apps opened from the home screen): then the whole page goes to Google. */
const NO_POPUP = ["auth/popup-blocked", "auth/operation-not-supported-in-this-environment", "auth/web-storage-unsupported"];

/** Sign in with Google. A guest's hidden sign-in is upgraded (same player id) when possible. */
export async function googleSignIn() {
  try {
    await googleSignInPopup();
  } catch (e) {
    if (!NO_POPUP.includes((e as { code?: string }).code ?? "")) throw e;
    const provider = new GoogleAuthProvider();
    const cur = auth.currentUser;
    if (cur && cur.isAnonymous) await linkWithRedirect(cur, provider);
    else await signInWithRedirect(auth, provider);
  }
}
async function googleSignInPopup() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cur = auth.currentUser;
  if (cur && cur.isAnonymous) {
    try {
      await linkWithPopup(cur, provider);
      return;
    } catch (e) {
      const cred = GoogleAuthProvider.credentialFromError(e as never);
      if (cred) {
        await signInWithCredential(auth, cred);
        return;
      }
      if ((e as { code?: string }).code === "auth/popup-closed-by-user") return;
      throw e;
    }
  }
  await signInWithPopup(auth, provider);
}
/** Back to a guest. */
export async function googleSignOut() {
  await signOut(auth);
  await signInAnonymously(auth);
}

/** Live: is this player signed in with Google? */
export function useAccount() {
  const [google, setGoogle] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void ensureSignedIn().catch(() => {});
    return auth.onAuthStateChanged((u) => {
      setGoogle(!!u?.providerData.some((p) => p.providerId === "google.com"));
      setReady(!!u);
    });
  }, []);
  return { google, ready, uid: auth.currentUser?.uid ?? null };
}

// Emulator tests only (development build): sign in with the emulator's test Google account, no popup.
if (import.meta.env.DEV)
  (globalThis as unknown as { __qslGoogle?: (sub: string) => Promise<unknown> }).__qslGoogle = (sub: string) =>
    signInWithCredential(auth, GoogleAuthProvider.credential(JSON.stringify({ sub, email: `${sub}@example.com`, email_verified: true })));
