import { useCallback, useEffect, useRef, useState } from "react";
import ambientTrackUrl from "./clavier-music-inspiring-cinematic-ambient-255033.mp3?url";

// Loud enough to register as a score rather than incidental sound, quiet
// enough to sit under anything else playing in the visitor's own tab.
const AMBIENT_VOLUME = 0.32;

// Any of these firing on the page counts as the "user gesture" browsers
// require before audio is allowed to play with sound -- not just a
// click on the sound button specifically.
const UNLOCK_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"];

/**
 * The page's own ambient score -- loops for the whole visit, starts
 * itself on mount, and is muteable via the fixed sound button.
 *
 * Autoplay-with-sound is gated by browser policy on a recent user
 * gesture. Navigating in from elsewhere in the app (a click on a case
 * study card, say) is often NOT enough by itself: that gesture fires on
 * the previous route, and this effect's own `play()` call happens a
 * tick later, outside the same call stack, so some browsers don't count
 * it. Rather than only exposing the sound button as the fallback, this
 * also retries on the very first interaction of ANY kind with this page
 * -- a click, key press, scroll, or touch -- so the track is far more
 * likely to actually be playing by the time someone notices it isn't,
 * without requiring them to find and click the button first.
 */
export default function useAmbientSound() {
  const [enabled, setEnabled] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    // StrictMode (see main.jsx) mounts every component twice in dev --
    // mount, clean up, mount again -- specifically to surface effect
    // bugs like this one: the FIRST instance's play() promise doesn't
    // reject until after its own cleanup has already run, which (without
    // this guard) landed asynchronously and stomped the SECOND, actually-
    // playing instance's `enabled: true` back to false. `cancelled` makes
    // a torn-down instance's own play()/catch outcome a no-op instead of
    // letting it clobber whichever instance is current.
    let cancelled = false;
    const audio = new Audio(ambientTrackUrl);
    audio.loop = true;
    audio.volume = AMBIENT_VOLUME;
    audioRef.current = audio;

    let unlocked = false;
    const tryPlay = () => {
      audio
        .play()
        .then(() => {
          if (cancelled) return;
          unlocked = true;
          setEnabled(true);
        })
        .catch((err) => {
          if (cancelled) return;
          console.warn("About Me: ambient track autoplay blocked", err); // eslint-disable-line no-console
          setEnabled(false);
        });
    };

    tryPlay();

    const onFirstInteraction = () => {
      if (!unlocked) tryPlay();
    };
    UNLOCK_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, onFirstInteraction, { once: true, passive: true });
    });

    return () => {
      cancelled = true;
      UNLOCK_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, onFirstInteraction);
      });
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const toggle = useCallback(() => {
    setEnabled((was) => {
      const next = !was;
      const audio = audioRef.current;
      if (audio) {
        if (next) audio.play().catch(() => {});
        else audio.pause();
      }
      return next;
    });
  }, []);

  return { enabled, toggle };
}
