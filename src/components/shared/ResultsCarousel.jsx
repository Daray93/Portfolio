import React, { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styled from "styled-components";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/* ---------- Styles ---------- */

const CarouselWrap = styled.div`
  width: 100%;
  overflow: hidden;
  padding: 1.5rem;
  background: ${({ theme }) => theme.cardInset};
  border-radius: ${({ theme }) => theme.radius?.lg || "16px"};
  position: relative;
`;

// $height, when set, pins the viewport to the active slide's measured
// height and animates between values as the slide changes -- opt-in
// (paired with $full below) since it only makes sense when exactly one
// slide is visible; a peek carousel with several partial slides showing
// at once has no single "active height" to match.
const Viewport = styled.div`
  overflow: hidden;
  ${(props) => (props.$height != null ? `height: ${props.$height}px;` : "")}
  transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
`;

const Track = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-direction: row;

  @media (max-width: 768px) {
    flex-direction: ${(props) => (props.$stackOnMobile ? "column" : "row")};
  }
`;

// $full -- takes the whole viewport instead of the default 75% peek, so
// only one slide is ever visible/centered at a time (no sliver of the
// next slide showing at the edge). Opt-in via `fullWidthSlides` so the
// existing peek-carousel usages (Kropt's image strip) are unaffected.
const Slide = styled.div`
  flex: ${(props) => (props.$full ? "0 0 100%" : "0 0 75%")};
  border-radius: ${({ theme }) => theme.radius?.md || "12px"};
  overflow: hidden;
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};
  position: relative;

  @media (max-width: 768px) {
    flex: ${(props) =>
      props.$full || props.$stackOnMobile ? "1 1 100%" : "0 0 90%"};
  }

  img,
  video {
    width: 100%;
    display: block;
    border-radius: inherit;
  }
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  ${(props) => (props.$side === "left" ? "left: 0.75rem;" : "right: 0.75rem;")}
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.45);
  color: white;
  cursor: pointer;
  transition: background 0.2s ease, opacity 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.65);
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
    pointer-events: none;
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
  cursor: pointer;
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
  fullWidthSlides = false,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    skipSnaps: false,
    dragFree: false,
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [activeHeight, setActiveHeight] = useState(null);
  const videoRefs = useRef({});
  const slideRefs = useRef({});

  // Determine what we are rendering
  const slides = items || images.map((src) => ({ type: "image", src }));

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  // Match the viewport's height to whichever slide is active, so slides
  // with different aspect ratios (e.g. a portrait vs. landscape video)
  // don't get squashed into a shared fixed height or leave dead space
  // around the shorter one. Re-measures on resize too, since a video's
  // rendered height depends on the viewport's own width.
  useEffect(() => {
    if (!fullWidthSlides) return;
    const measure = () => {
      const el = slideRefs.current[selectedIndex];
      if (el) setActiveHeight(el.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [selectedIndex, fullWidthSlides]);

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
      {canScrollPrev && (
        <ArrowButton
          type="button"
          $side="left"
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Previous slide"
        >
          <FiChevronLeft size={20} />
        </ArrowButton>
      )}
      {canScrollNext && (
        <ArrowButton
          type="button"
          $side="right"
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Next slide"
        >
          <FiChevronRight size={20} />
        </ArrowButton>
      )}

      <Viewport ref={emblaRef} $height={fullWidthSlides ? activeHeight : null}>
        <Track $stackOnMobile={stackVideosOnMobile}>
          {slides.map((item, i) => {
            const isVideo = item.type === "video";
            return (
              <Slide
                key={i}
                ref={(el) => (slideRefs.current[i] = el)}
                $full={fullWidthSlides}
                $stackOnMobile={stackVideosOnMobile && isVideo}
                $clickable={!isVideo}
                onClick={() => !isVideo && openModal?.(item.src, "image")}
              >
                {isVideo ? (
                  <video
                    ref={(el) => (videoRefs.current[i] = el)}
                    controls
                    muted
                    playsInline
                    autoPlay={i === selectedIndex}
                    preload={i === selectedIndex ? "auto" : "none"}
                    onLoadedMetadata={() => {
                      if (fullWidthSlides && i === selectedIndex) {
                        setActiveHeight(slideRefs.current[i]?.offsetHeight);
                      }
                    }}
                  >
                    <source src={item.src} type="video/mp4" />
                  </video>
                ) : (
                  <img src={item.src} alt={item.alt || `Slide ${i + 1}`} />
                )}
              </Slide>
            );
          })}
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