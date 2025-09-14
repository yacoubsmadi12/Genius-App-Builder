import { 
  getAuth, 
  signInWithRedirect, 
  getRedirectResult,
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { apiRequest } from "./queryClient";
import { auth } from "./firebase";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    throw new Error(`Google sign-in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      // Register user in our backend
      await registerUserInBackend(result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    throw new Error(`Redirect result handling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await registerUserInBackend(result.user);
    return result.user;
  } catch (error) {
    throw new Error(`Email sign-in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Register in our backend
    await apiRequest("POST", "/api/auth/register", {
      email,
      name,
      provider: "email",
      firebaseUid: result.user.uid
    });

    return result.user;
  } catch (error) {
    throw new Error(`Email sign-up failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(`Password reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function registerUserInBackend(firebaseUser: FirebaseUser) {
  try {
    await apiRequest("POST", "/api/auth/firebase", {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      photoURL: firebaseUser.photoURL
    });
  } catch (error) {
    console.error("Failed to register user in backend:", error);
  }
}

export function getAuthToken(): string | null {
  return auth.currentUser?.uid || null;
}
