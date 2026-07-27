import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

// Tracks whether the visitor is signed in to the shared NDA-viewer account.
// Backed by Firebase Auth's own session — no manual storage bookkeeping.
export default function useProtectedAccess() {
  const [isUnlocked, setIsUnlocked] = useState(null); // null = still checking

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUnlocked(!!user);
    });
    return unsubscribe;
  }, []);

  return { isUnlocked, loading: isUnlocked === null };
}
