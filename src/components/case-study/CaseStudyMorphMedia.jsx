import styled from "styled-components";
import { motion } from "framer-motion";

// Same layout transition used by the homepage's morphing cells (see
// HoverCardVoir / HoverCard / Splash.jsx) -- keeping the duration/easing
// identical on both ends is what makes the grow read as one animation
// rather than two independent ones meeting in the middle.
const MORPH_TRANSITION = { layout: { duration: 0.5, ease: "easeInOut" } };

// The page panel itself is what morphs from the homepage cell (see
// `morphId` on CaseStudyLayout) -- this is just a nicely-sized medallion
// for the media to live in once the panel has landed, so it isn't
// layoutId'd itself. Only the media inside shares a (separate) layoutId
// with the cell's own video/image, so it visibly scales into place
// instead of crossfading.
const Frame = styled.div`
  position: relative;
  width: min(420px, 60%);
  aspect-ratio: 1 / 1;
  margin: 1rem auto 0;
  border-radius: clamp(18px, 2.5vw, 32px);
  border: 1px solid ${({ theme }) => theme.border};
  overflow: hidden;
  background: ${({ theme }) => theme.cardBackground};
  box-shadow: ${({ theme }) => theme.shadowSm};
`;

const Video = styled(motion.video)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Image = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: ${({ $fit }) => $fit};
  display: block;
`;

// Landing spot for a homepage project cell's media. Pass the same
// `morphId` given to that cell (HoverCardVoir/HoverCard's `morphId` prop)
// plus either `video` or `image` -- the nested `${morphId}-media`
// layoutId grows the cell's video/image into this box.
export default function CaseStudyMorphMedia({ morphId, video, image, imageFit = "contain" }) {
  return (
    <Frame>
      {video ? (
        <Video
          layoutId={`${morphId}-media`}
          layout
          transition={MORPH_TRANSITION}
          src={video}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : image ? (
        <Image
          layoutId={`${morphId}-media`}
          layout
          transition={MORPH_TRANSITION}
          src={image}
          alt=""
          $fit={imageFit}
        />
      ) : null}
    </Frame>
  );
}
