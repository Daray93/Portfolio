import React, { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styled from "styled-components";

/* ---------- Styles ---------- */

const CarouselWrap = styled.div`
  width: 100%;
  overflow: hidden;
  padding: 1.5rem;
  background: ${({ theme }) => theme.cardInset};
  border-radius: ${({ theme }) => theme.radius?.lg || "16px"};
`;

const Viewport = styled.div`
  overflow: hidden;
`;

const Track = styled.div`
  display: flex;
  gap: 1.5rem;

  flex-direction: ${(props) => (props.stackOnMobile ? "row" : "row")};

  @media (max-width: 768px) {
    flex-direction: ${(props) => (props.stackOnMobile ? "column" : "row")};
  }
`;

const Slide = styled.div`
  flex: 0 0 75%;
  border-radius: ${({ theme }) => theme.radius?.md || "12px"};
  overflow: hidden;
  cursor: none;
  position: relative;

  @media (max-width: 768px) {
    flex: ${(props) => (props.stackOnMobile ? "1 1 100%" : "0 0 90%")};
  }

  img,
  video {
    width: 100%;
    display: block;
    border-radius: inherit;
  }
`;

/* ---------- Dots ---------- */

const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Dot = styled.button`
  height: 8px;
  border-radius: 999px;
  border: none;
  cursor: none;
  background: ${({ theme }) => theme.textTertiary};
  opacity: 0.4;
  width: 4px;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.25s ease, background 0.25s ease;

  &[data-active="true"] {
    width: 28px;
    opacity: 1;
    background: ${({ theme }) => theme.accent};
  }
`;

/* ---------- Component ---------- */

export default function ResultsCarousel({
  images = [],        // legacy: image-only mode
  items = null,       // new: mixed images/videos mode
  openModal,
  stackVideosOnMobile = false,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    skipSnaps: false,
    dragFree: false,
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const videoRefs = useRef({});

  // Determine what we are rendering
  const slides = items || images.map((src) => ({ type: "image", src }));

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  // Only the active slide should load/play — inactive video slides stay unloaded.
  useEffect(() => {
    slides.forEach((item, i) => {
      const el = videoRefs.current[i];
      if (!el || item.type !== "video") return;
      if (i === selectedIndex) {
        el.play?.().catch(() => {});
      } else {
        el.pause?.();
      }
    });
  }, [selectedIndex, slides]);

  return (
    <CarouselWrap>
      <Viewport ref={emblaRef}>
        <Track stackOnMobile={stackVideosOnMobile}>
          {slides.map((item, i) => (
            <Slide
              key={i}
              stackOnMobile={stackVideosOnMobile && item.type === "video"}
              
            >
              {item.type === "video" ? (
                <video
                  ref={(el) => (videoRefs.current[i] = el)}
                  controls
                  muted
                  playsInline
                  autoPlay={i === selectedIndex}
                  preload={i === selectedIndex ? "auto" : "none"}
                >
                  <source src={item.src} type="video/mp4" />
                </video>
              ) : (
                <img src={item.src} alt={item.alt || `Slide ${i + 1}`} />
              )}
            </Slide>
          ))}
        </Track>
      </Viewport>

      {/* Modern pill dots */}
      <Dots>
        {slides.map((_, i) => (
          <Dot
            key={i}
            data-active={i === selectedIndex}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => emblaApi?.scrollTo(i)}
          />
        ))}
      </Dots>
    </CarouselWrap>
  );
}