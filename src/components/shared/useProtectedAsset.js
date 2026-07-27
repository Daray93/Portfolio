import { useEffect, useState } from "react";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

// Loads an image/video that lives in Firebase Storage under `protected/...`,
// which Storage Security Rules only serve to signed-in visitors.
// Usage: const { url, loading } = useProtectedAsset("protected/orthovive/brief.png");
export default function useProtectedAsset(storagePath) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storagePath) return;
    let cancelled = false;
    setLoading(true);

    getDownloadURL(ref(storage, storagePath))
      .then((downloadUrl) => {
        if (!cancelled) setUrl(downloadUrl);
      })
      .catch((err) => {
        console.error(`Failed to load protected asset "${storagePath}":`, err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [storagePath]);

  return { url, loading };
}
