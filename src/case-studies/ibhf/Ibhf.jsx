import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  CaseStudyLayout,
  CaseStudyPage,
  CaseStudySection,
  CaseStudyHero,
} from "../../components/case-study/Index";
import OtherProjects from "../../components/shared/OtherProjects";
import { FiExternalLink } from "react-icons/fi";

// Assets
import ibhfHero from "./assets/IBHF-Desktop.png";
import ibhfHeroMobile from "./assets/ibhf-Mobile.png";
import liveryLogo from "./assets/Livery_Irish Bee and Heritage Foundation (1).png";
import excelSitemap from "./assets/Excel.png";
import irishBee from "./assets/BlackBee.png";

/* ---------- Shared styles ---------- */

const Paragraph = styled.p`
  font-size: 1.05rem;
  line-height: 1.55;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const Callout = styled.div`
  padding: ${({ theme }) => `${theme.space[4]} ${theme.space[5]}`};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.cardInset};
  font-size: 0.95rem;
  line-height: 1.45;
`;

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[2]};
`;

const Pill = styled.span`
  padding: ${({ theme }) => `${theme.space[1]} ${theme.space[3]}`};
  border-radius: 999px;
  background: ${({ theme }) => theme.cardInset};
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
`;

const RoleContainer = styled.div`
  font-size: 1.05rem;
  line-height: 1.55;
  margin: ${({ theme }) => `${theme.space[4]} 0 0 0`};
  color: ${({ theme }) => theme.text};
`;

const RoleHeading = styled.h3`
  margin: 0 0 ${({ theme }) => theme.space[3]} 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text};
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  border-radius: ${({ theme }) => theme.radius.md};
  object-fit: cover;
  cursor: pointer;
`;

const MediaCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[2]};
  background: ${({ theme }) => theme.cardInset};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.space[5]};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.space[3]};
  }
`;

const MediaRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space[5]};
  flex-wrap: wrap;

  ${MediaCard} {
    flex: 1 1 280px;
  }
`;

const Caption = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.4;
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.space[5]};
`;

const UserCard = styled.div`
  background: ${({ theme }) => theme.cardInset};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.space[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[2]};

  h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[3]};
`;

const CTAButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: ${({ theme }) => theme.radius.btn};
  border: 1px solid ${({ theme }) => theme.buttonPrimaryBg};
  font-family: "Geist", sans-serif;
  font-weight: 500;
  font-size: 1rem;
  color: ${({ theme }) => theme.buttonPrimaryText};
  background: ${({ theme }) => theme.buttonPrimaryBg};
  transition: all 0.25s ease;

  &:hover {
    background: ${({ theme }) => theme.buttonPrimaryHover};
    border-color: ${({ theme }) => theme.buttonPrimaryHover};
    color: ${({ theme }) => theme.buttonPrimaryHoverText};
  }
`;

const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: ${({ theme }) => theme.space[5]};
`;

const Testimonial = styled.blockquote`
  margin: 0;
  padding: ${({ theme }) => theme.space[5]};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.cardInset};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[3]};
`;

const TestimonialText = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.55;
  font-style: italic;
  color: ${({ theme }) => theme.text};
`;

const TestimonialAuthor = styled.cite`
  font-style: normal;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textSecondary};
`;

/* ---------- Modal ---------- */

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
`;

const ModalImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.body};
`;

const CloseButton = styled.button`
  position: absolute;
  top: -44px;
  right: 0;
  background: none;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
`;

/* ---------- Scrolling hero screenshots ---------- */

// Both hero images are full-page screenshots (much taller than they are
// wide), so rather than cropping them down to fit a fixed frame, each is
// shown at full width and scrolled into view on hover -- letting a
// visitor "scroll" the actual desktop and mobile pages without leaving
// the case study. The two sit side by side so both breakpoints of the
// site are visible in the hero at once.
const HeroMediaRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(0.75rem, 3vw, 1.5rem);
  width: 100%;
  flex-wrap: nowrap;
  margin: 0 auto 2rem;

  // Only true phones need the two panes stacked -- everything above that
  // keeps them side by side, at fixed proportions rather than a
  // flex-grow/shrink split (which was collapsing the desktop pane to
  // nothing in some widths).
  @media (max-width: 480px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const ScrollFrame = styled.div`
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  box-shadow: ${({ theme }) => theme.shadowSm};
  cursor: pointer;
  flex-shrink: 0;
  // Height is the shared dimension -- each pane's width just falls out of
  // its own aspect-ratio, so the desktop (wide) and mobile (narrow) frames
  // always stand the same height side by side instead of the mobile pane
  // looking short next to a much taller desktop one.
  height: clamp(200px, 26vw, 350px);

  ${({ $variant, theme }) =>
    $variant === "mobile"
      ? `
          aspect-ratio: 9 / 19.5;
          border-radius: clamp(16px, 3vw, 28px);
        `
      : `
          aspect-ratio: 16 / 9;
          border-radius: ${theme.radius.xxl};
        `}

  @media (max-width: 480px) {
    height: auto;
    width: 100%;
    max-width: 320px;
  }
`;

const ScrollImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  display: block;
  transform: translateY(${({ $offset }) => `-${$offset}px`});
`;

function ScrollableHero({ src, alt, variant = "desktop" }) {
  const frameRef = useRef(null);
  const imgRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [maxOffset, setMaxOffset] = useState(0);

  const measure = () => {
    if (!frameRef.current || !imgRef.current) return;
    const frameHeight = frameRef.current.clientHeight;
    const imageHeight = imgRef.current.clientHeight;
    setMaxOffset(Math.max(0, imageHeight - frameHeight));
  };

  useEffect(() => {
    // A plain `onLoad` handler misses cached images -- if the browser
    // already has this image decoded (e.g. it's reused elsewhere on the
    // page), it can finish loading before the listener even attaches, so
    // the height never gets measured. ResizeObserver catches the image's
    // real box whenever it settles, regardless of load timing.
    if (!frameRef.current || !imgRef.current) return;
    const ro = new ResizeObserver(measure);
    ro.observe(frameRef.current);
    ro.observe(imgRef.current);
    measure();

    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Pace the scroll by distance rather than a fixed duration, so short and
  // very tall screenshots both scroll at roughly the same felt speed.
  const durationMs = Math.min(14000, Math.max(2500, maxOffset * 6));

  return (
    <ScrollFrame
      ref={frameRef}
      $variant={variant}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ScrollImage
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={measure}
        $offset={hovered ? maxOffset : 0}
        style={{
          transitionProperty: "transform",
          transitionDuration: `${hovered ? durationMs : 500}ms`,
          transitionTimingFunction: hovered ? "linear" : "ease-out",
        }}
      />
    </ScrollFrame>
  );
}

function IbhfHeroMedia({ desktopSrc, mobileSrc }) {
  return (
    <HeroMediaRow>
      <ScrollableHero
        src={desktopSrc}
        alt="Scrollable screenshot of the IBHF desktop homepage"
        variant="desktop"
      />
      <ScrollableHero
        src={mobileSrc}
        alt="Scrollable screenshot of the IBHF mobile homepage"
        variant="mobile"
      />
    </HeroMediaRow>
  );
}

/* ---------- IBHF Case Study ---------- */

export default function IbhfCaseStudy() {
  const [modalSrc, setModalSrc] = useState(null);
  const lastActiveRef = useRef(null);

  const openModal = (src) => {
    lastActiveRef.current = document.activeElement;
    setModalSrc(src);
  };

  const closeModal = () => {
    setModalSrc(null);
    lastActiveRef.current?.focus?.();
  };

  useEffect(() => {
    if (!modalSrc) return;
    const onKey = (e) => e.key === "Escape" && closeModal();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "auto";
    };
  }, [modalSrc]);

  return (
    <>
      <CaseStudyLayout
        sections={[
          { id: "overview", label: "Overview" },
          { id: "problem", label: "Problem" },
          { id: "goal", label: "Goal" },
          { id: "process", label: "Process" },
          { id: "outcomes", label: "Outcomes" },
        ]}
      >
        <CaseStudyPage>
          {/* ---------- Overview ---------- */}
          <CaseStudySection id="overview" title="Overview" tldrVisible>
            <CaseStudyHero
              title="Irish Bee & Heritage Foundation"
              subtitle="A WordPress site for a beekeeping and heritage foundation, built from a logo, a legend, and a spreadsheet"
            >
              <Paragraph>
                <strong>IBHF is a foundation</strong> promoting Irish beekeeping
                and native craft heritage. I designed and built their WordPress
                site end to end, including a course catalogue with paid
                enrolment, a shop, and a donations flow, working from a very
                small set of materials the stakeholders were able to provide.
              </Paragraph>

              <IbhfHeroMedia desktopSrc={ibhfHero} mobileSrc={ibhfHeroMobile} />

              <PillRow>
                <Pill>WordPress</Pill>
                <Pill>WooCommerce</Pill>
                <Pill>Payments &amp; Donations</Pill>
                <Pill>Brand Application</Pill>
                <Pill>Foundation</Pill>
              </PillRow>

              <ButtonWrapper>
                <CTAButton
                  href="https://ibhf.ie"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit ibhf.ie <FiExternalLink size={18} />
                </CTAButton>
              </ButtonWrapper>
            </CaseStudyHero>

            <RoleContainer>
              <RoleHeading>My Role</RoleHeading>
              I designed and built the site solo, turning the stakeholders'
              livery and a rough page list into a full information
              architecture, a WordPress theme carrying their brand, and the
              WooCommerce setup behind course payments, the shop, and
              donations.
            </RoleContainer>
          </CaseStudySection>

          {/* ---------- Problem ---------- */}
          <CaseStudySection
            id="problem"
            title="Problem"
            tldr="No web presence at all -- courses arranged over email, donations handled manually, and a brand identity that had never been applied anywhere beyond a logo file."
            tldrMedia={
              <MediaCard>
                <Image
                  src={liveryLogo}
                  alt="Irish Bee and Heritage Foundation livery logo"
                  onClick={() => openModal(liveryLogo)}
                />
                <Caption>
                  The livery was the anchor for the whole site's visual
                  identity: the triskele, the bee, and the green and gold
                  palette.
                </Caption>
              </MediaCard>
            }
          >
            <Paragraph>
              Before this project, IBHF had no web presence at all. Courses
              were arranged and paid for over email, donations were handled
              manually, and the foundation's own livery had never actually
              been applied anywhere beyond a logo file. That's real
              operational cost, not just a missing nice-to-have: every course
              booking was a back-and-forth over email instead of a two-minute
              checkout, every donation required manual handling instead of
              self-serve payment, and there was nowhere online to point a
              prospective student or donor that actually represented who the
              foundation was.
            </Paragraph>

            <Paragraph>
              What I had to start from was three documents and a stakeholder
              meeting: the livery logo, a short document explaining the
              meaning of the triskele symbol at its centre, and a spreadsheet
              sketching out the pages they wanted. There was no copy, no
              photography brief, and no existing site to work from &mdash;
              everything else had to be sourced, structured, or written from
              scratch.
            </Paragraph>

            <MediaRow>
              <MediaCard>
                <Image
                  src={liveryLogo}
                  alt="Irish Bee and Heritage Foundation livery logo"
                  onClick={() => openModal(liveryLogo)}
                />
                <Caption>
                  The triskele &mdash; three spirals representing continuity and
                  the interconnectedness of past, present, and future &mdash;
                  wraps around a bee to tie beekeeping and Irish heritage into
                  one mark.
                </Caption>
              </MediaCard>

              <MediaCard>
                <Image
                  src={excelSitemap}
                  alt="Stakeholder-provided spreadsheet listing the site's intended pages"
                  onClick={() => openModal(excelSitemap)}
                />
                <Caption>
                  The full page list I was given: a flat spreadsheet of
                  section headings, with no hierarchy, no navigation
                  structure, and no indication of what needed a shop page
                  versus a course page versus a simple content page.
                </Caption>
              </MediaCard>
            </MediaRow>

            <Callout>
              None of this was a broken system to fix &mdash; it was closer to
              no system at all. That gap is what made every choice that
              followed (information architecture, brand, platform) load
              bearing rather than cosmetic: there was nothing existing to
              fall back on if any of them were wrong.
            </Callout>
          </CaseStudySection>

          {/* ---------- Goal ---------- */}
          <CaseStudySection
            id="goal"
            title="Goal"
            tldr="Turn three static documents into a real working site -- proper navigation, real content, and a payment system -- built on WordPress specifically so the foundation could run it themselves after handover."
          >
            <Paragraph>
              The goal was to turn those three documents into a working site
              with real navigation, real content, and a payment system the
              foundation could run day-to-day &mdash; not just a set of pages
              that looked like a foundation but still relied on someone else
              to operate.
            </Paragraph>

            <Paragraph>
              That's also why the platform choice mattered as much as the
              design: WordPress and WooCommerce, specifically because the
              foundation is run by volunteers, not a marketing team. Building
              it there meant they could add new courses, update prices, and
              edit page content themselves once the site was handed over,
              instead of coming back to a developer for every change &mdash;
              the goal wasn't just a finished site, it was one that didn't
              quietly become dependent on me after launch.
            </Paragraph>
          </CaseStudySection>

          {/* ---------- Process ---------- */}
          <CaseStudySection
            id="process"
            title="Process"
            tldr="A flat spreadsheet became a real information architecture, the livery became a full brand system instead of just a logo, and WooCommerce/Stripe replaced email bookings and manual donations -- slowed by two real obstacles: accounts only the foundation could create, and almost no copy to build from."
            tldrMedia={
              <MediaCard>
                <Image
                  src={ibhfHero}
                  alt="Finished IBHF homepage carrying the livery's green, gold, and cream palette"
                  onClick={() => openModal(ibhfHero)}
                />
                <Caption>
                  The finished homepage, carrying the livery's palette
                  through navigation, buttons, and hero imagery.
                </Caption>
              </MediaCard>
            }
          >
            <Paragraph>
              The spreadsheet grouped topics loosely under headings like
              "About Us", "Beekeeping &amp; Heritage Programs", "Bee Diseases
              &amp; Pests", "Gallery", "Shop", and "Links", plus a standalone
              donate button. I turned that list into a real information
              architecture: a primary nav of About Us, Courses, Heritage
              Programs, and Bee Diseases &amp; Pests, with the shop basket and
              a persistent Donate button both kept one click away in the
              header.
            </Paragraph>

            <UserGrid>
              <UserCard>
                <h4>About Us</h4>
                <p>
                  Who the foundation is, the Irish Blackbee they work to
                  protect, and the story behind the triskele design.
                </p>
              </UserCard>

              <UserCard>
                <h4>Courses</h4>
                <p>
                  Beginner beekeeping through to advanced stages, sold and
                  paid for directly on the site rather than handled over
                  email.
                </p>
              </UserCard>

              <UserCard>
                <h4>Heritage Programs</h4>
                <p>
                  Basket making, skep making, candle and mead making, and
                  other native crafts the spreadsheet grouped in with
                  beekeeping.
                </p>
              </UserCard>

              <UserCard>
                <h4>Bee Diseases &amp; Pests</h4>
                <p>
                  A reference section on foul brood, chalk brood, the Asian
                  hornet, and varroa &mdash; practical content for working
                  beekeepers.
                </p>
              </UserCard>
            </UserGrid>

            <Paragraph>
              With no wider brand guidelines to work from, the livery did
              double duty as both logo and style reference. I pulled the
              deep green, gold, and cream straight from it for the site's
              palette, and used the triskele's meaning &mdash; continuity,
              cycles, and the interconnectedness of past, present, and future
              &mdash; as the reasoning behind the "About Us" content, rather
              than treating the symbol as decoration.
            </Paragraph>

            <MediaRow>
              <MediaCard>
                <Image
                  src={ibhfHero}
                  alt="Finished IBHF homepage carrying the livery's green, gold, and cream palette"
                  onClick={() => openModal(ibhfHero)}
                />
                <Caption>
                  The finished homepage, carrying the livery's palette
                  through the navigation, buttons, and hero imagery.
                </Caption>
              </MediaCard>

              <MediaCard>
                <Image
                  src={irishBee}
                  alt="Bee photography selected for the site to reinforce the conservation focus"
                  onClick={() => openModal(irishBee)}
                />
                <Caption>
                  Photography was chosen to keep the focus on conservation
                  and the bees themselves, alongside the illustrated livery.
                </Caption>
              </MediaCard>
            </MediaRow>

            <Paragraph>
              The site runs on WordPress with WooCommerce handling both the
              course catalogue and the shop, so beekeeping courses can be
              booked and paid for online instead of over email. A donations
              add-on sits alongside it for one-off and recurring gifts, with
              Stripe handling payment processing across both.
            </Paragraph>

            <Paragraph>
              Two things slowed the build down more than the design work
              itself.
            </Paragraph>

            <UserGrid>
              <UserCard>
                <h4>Accounts only they could create</h4>
                <p>
                  Stripe and the SiteGround hosting account both had to be
                  registered in the foundation's name, not mine, since they
                  needed ongoing ownership and billing control. Payment
                  integration and go-live both had to wait on stakeholders
                  creating and sharing access to accounts I couldn't set up
                  myself.
                </p>
              </UserCard>

              <UserCard>
                <h4>Not enough content to build from</h4>
                <p>
                  Beyond the livery, the triskele document, and the page
                  list, there was no copy for any page. Most of the written
                  content &mdash; course descriptions, the About Us story, the
                  disease and pest reference pages &mdash; had to be drafted
                  from research rather than supplied by the client.
                </p>
              </UserCard>
            </UserGrid>
          </CaseStudySection>

          {/* ---------- Outcomes ---------- */}
          <CaseStudySection
            id="outcomes"
            title="Outcomes"
            tldr="Live at ibhf.ie with real course/donation payments running and stakeholders glad the manual handling is gone -- though I haven't checked whether it actually moved enrollment or donation numbers, only that the deliverable shipped and works."
          >
            <Paragraph>
              From three documents and a stakeholder meeting, IBHF now has a
              live site with paid course enrolment, a shop, and a working
              donations flow that the foundation can run and update
              themselves — the core problem (no web presence, manual
              bookings, a brand that only existed as a logo) is resolved, and
              both stakeholders confirmed it in their own words:
            </Paragraph>

            <ButtonWrapper>
              <CTAButton
                href="https://ibhf.ie"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit ibhf.ie <FiExternalLink size={18} />
              </CTAButton>
            </ButtonWrapper>

            <TestimonialGrid>
              <Testimonial>
                <TestimonialText>
                  Gus McCoy said he was really pleased with how the site
                  turned out &mdash; he felt it captured the foundation
                  properly and was glad to finally have courses and donations
                  running through the site itself instead of being handled
                  manually.
                </TestimonialText>
                <TestimonialAuthor>Gus McCoy, IBHF</TestimonialAuthor>
              </Testimonial>

              <Testimonial>
                <TestimonialText>
                  Paul O'Brien was thankful for how the project came together
                  given how little he and the team had to hand over at the
                  start, and said he was happy with the finished result.
                </TestimonialText>
                <TestimonialAuthor>Paul O'Brien, IBHF</TestimonialAuthor>
              </Testimonial>
            </TestimonialGrid>

            <Paragraph>
              What I haven't done is go back and check enrolment or donation
              numbers against the pre-site baseline, so "stakeholders are
              happy and the manual work is gone" is real, but "this
              measurably grew courses or donations" isn't something I can
              back up yet. That's the obvious next step to actually close the
              loop on whether the goal was met, not just whether the
              deliverable shipped and works.
            </Paragraph>
          </CaseStudySection>
        </CaseStudyPage>

        <OtherProjects currentProjectId="ibhf" />
      </CaseStudyLayout>

      {/* ---------- Modal ---------- */}
      {modalSrc && (
        <ModalOverlay onClick={closeModal}>
          <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={closeModal}>×</CloseButton>
            <ModalImage src={modalSrc} alt="Preview" />
          </div>
        </ModalOverlay>
      )}
    </>
  );
}
