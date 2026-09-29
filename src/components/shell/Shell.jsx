import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import Backdrop from "../showcase/Backdrop";
import SiteHeader from "../chrome/SiteHeader";
import SiteMenu from "../chrome/SiteMenu";
import { skipPreload } from "../chrome/Preloader";
import { useMotionPreference } from "../../styles/MotionPreferenceContext";
import { easeArr } from "../../styles/motion";
import { ShellContext, SHELL_PAGES } from "./context";

// The frame Work, About and Websites share. The background, header and menu
// stay mounted the whole time; only the page in the middle changes, sliding
// in the direction of the header's pill nav (Work -> About -> Websites
// travels left, back travels right) while the pill slides and the
// background re-tints. Each page is still its own route with its own URL.
//
// Pages talk to the frame through useShell():
//   setPalette([key, floor, base])  the background's colours
//   setImage(src | null)            a picture for the background to blur
//                                   (the "ambient" mode, see Backdrop)
//   setChrome({ overIntro, away })  the header over the loading screen, or
//                                   stepping aside while a card opens
//   menuOpen                        so a page can go inert under the menu
//   slidIn()                        true when the page arrived by sliding in
//                                   from another (skip its own entrance)

const Frame = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  color: ${({ theme }) => theme.text};
`;

const Scenes = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
`;

const Scene = styled(motion.div)`
  position: absolute;
  inset: 0;
`;

// how far a page travels as it slides in or out, as a share of the screen
const TRAVEL = "8%";
const SLIDE_S = 0.75;

const scene = {
  enter: ({ dir, reduced }) => (reduced ? { opacity: 0 } : { opacity: 0, x: dir > 0 ? TRAVEL : `-${TRAVEL}` }),
  center: { opacity: 1, x: 0 },
  exit: ({ dir, reduced }) => (reduced ? { opacity: 0 } : { opacity: 0, x: dir > 0 ? `-${TRAVEL}` : TRAVEL }),
};

// An exiting page keeps rendering what it rendered, not the new route.
function Frozen({ outlet }) {
  const [held] = useState(outlet);
  return held;
}

export default function Shell() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const { reduced } = useMotionPreference();

  // arriving anywhere but Work: no loading screen this visit
  const [firstPage] = useState(pathname);
  if (firstPage !== "/") skipPreload();

  const [menuOpen, setMenuOpen] = useState(false);
  const [palette, setPalette] = useState(undefined);
  const [image, setImage] = useState(null);
  const [chrome, setChrome] = useState({ overIntro: false, away: false });

  // which way to slide: along the pill nav's order
  const prev = useRef(pathname);
  const dir = Math.sign(SHELL_PAGES.indexOf(pathname) - SHELL_PAGES.indexOf(prev.current)) || 1;
  // (pages reset setChrome themselves when they leave -- their effects run
  // before this one, so resetting it here would undo what the new page set)
  useEffect(() => {
    prev.current = pathname;
    setMenuOpen(false);
  }, [pathname]);

  // the frame itself never scrolls (a page that needs to scrolls inside
  // itself), and no rubber-band bounce on iOS
  useEffect(() => {
    const html = document.documentElement;
    const was = { overflow: html.style.overflow, overscroll: html.style.overscrollBehavior };
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = was.overflow;
      html.style.overscrollBehavior = was.overscroll;
    };
  }, []);

  // Once the frame has shown its first page, later pages arrive by the
  // slide alone, so they skip entrances of their own.
  const shown = useRef(false);
  useEffect(() => {
    shown.current = true;
  }, []);
  const slidIn = useCallback(() => shown.current, []);

  const value = useMemo(() => ({ menuOpen, setPalette, setImage, setChrome, slidIn }), [menuOpen, slidIn]);
  const custom = { dir, reduced };

  return (
    <ShellContext.Provider value={value}>
      <Frame>
        <Backdrop palette={palette} image={image} still={reduced} />
        <SiteHeader
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((o) => !o)}
          overIntro={chrome.overIntro}
          away={chrome.away}
        />
        <SiteMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        <Scenes inert={menuOpen}>
          <AnimatePresence initial={false} custom={custom}>
            <Scene
              key={pathname}
              custom={custom}
              variants={scene}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduced ? 0.2 : SLIDE_S, ease: easeArr.inOut }}
            >
              <Frozen outlet={outlet} />
            </Scene>
          </AnimatePresence>
        </Scenes>
      </Frame>
    </ShellContext.Provider>
  );
}
