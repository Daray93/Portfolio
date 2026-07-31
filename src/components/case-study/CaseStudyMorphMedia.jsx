import styled from "styled-components";

// A wide hero media box for the top of a case study's first section --
// used by Neuroloop, OrthoVive, and IBHF (Kropt has its own bespoke
// video+image hero instead, see Kropt.jsx). Used to be a small (min(420px,
// 60%), 1:1) medallion sized specifically as the landing spot for a
// homepage->page morph animation; now that there's no morph (see
// Splash.jsx), that sizing just read as an oddly small, vestigial square
// floating above the real content. Widened into a proper hero instead.
const Frame = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  aspect-ratio: 16 / 9;
  margin: 0 auto 2rem;
  border-radius: clamp(18px, 2.5vw, 32px);
  border: 1px solid ${({ theme }) => theme.border};
  overflow: hidden;
  background: ${({ theme }) => theme.cardBackground};
  box-shadow: ${({ theme }) => theme.shadowSm};
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: ${({ $fit }) => $fit};
  display: block;
`;

// Pass either `video` or `image` -- whichever the case study actually has.
export default function CaseStudyMorphMedia({ video, image, imageFit = "contain" }) {
  return (
    <Frame>
      {video ? (
        <Video src={video} autoPlay loop muted playsInline />
      ) : image ? (
        <Image src={image} alt="" $fit={imageFit} />
      ) : null}
    </Frame>
  );
}
