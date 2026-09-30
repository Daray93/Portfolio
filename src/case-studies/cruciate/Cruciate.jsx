import { FiExternalLink } from "react-icons/fi";
import { CaseStudyLayout, CaseStudyPage, CaseStudySection } from "../../components/case-study/Index";
import {
  Paragraph,
  Subheading,
  Facts,
  List,
  Callout,
  LiveLink,
  MediaPlaceholder,
  MediaRow,
} from "../../components/case-study/Prose";
import Figure, { Figures } from "../../components/case-study/Figure";
import {
  Insights,
  Challenge,
  BeforeAfter,
  Criteria,
  Closing,
  SubSection,
  Questions,
  Sources,
  Steps,
} from "../../components/case-study/Process";
import MoreWork from "../../components/case-study/MoreWork";
import ViewToggle from "../../components/case-study/ViewToggle";
import onboardingSurgery from "./assets/screens/onboarding-surgery.jpg?w=720&format=webp&quality=85";
import todaysRehab from "./assets/screens/todays-rehab.jpg?w=720&format=webp&quality=85";
import romTrend from "./assets/screens/rom-trend.jpg?w=720&format=webp&quality=85";
import calendarScreen from "./assets/screens/calendar.jpg?w=720&format=webp&quality=85";
import sessionCelebration from "./assets/screens/session-celebration.jpg?w=720&format=webp&quality=85";
import romLogged from "./assets/screens/rom-logged.jpg?w=720&format=webp&quality=85";
import checkinQ1 from "./assets/screens/checkin-q1.jpg?w=720&format=webp&quality=85";
import checkinQ2 from "./assets/screens/checkin-q2.jpg?w=720&format=webp&quality=85";
import checkinQ3 from "./assets/screens/checkin-q3.jpg?w=720&format=webp&quality=85";
import romExtension from "./assets/screens/rom-extension.jpg?w=720&format=webp&quality=85";
import romFlexion from "./assets/screens/rom-flexion.jpg?w=720&format=webp&quality=85";
import homeScreen from "./assets/screens/home.jpg?w=720&format=webp&quality=85";
import checkInComplete from "./assets/screens/check-in-complete.jpg?w=720&format=webp&quality=85";
import phasesScreen from "./assets/screens/phases.jpg?w=720&format=webp&quality=85";
import symptomsQuestion from "./assets/screens/symptoms-question.jpg?w=720&format=webp&quality=85";
import symptomsWhich from "./assets/screens/symptoms-which.jpg?w=720&format=webp&quality=85";
import symptomsPaused from "./assets/screens/symptoms-paused.jpg?w=720&format=webp&quality=85";
import waiverScreen from "./assets/screens/waiver.jpg?w=720&format=webp&quality=85";
import cbdQuestion from "./assets/screens/cbd-question-light.png?w=720&format=webp&quality=85";
import kneeHinge from "./assets/process/knee-1-hinge.png?w=1200&format=webp&quality=85";
import kneeFirst from "./assets/process/knee-2-first-illustration.png?w=1200&format=webp&quality=85";
import kneeFinal from "./assets/process/knee-3-final.png?w=1400&format=webp&quality=85";
import kneeCheckIn from "./assets/process/knee-4-check-in.png?w=1200&format=webp&quality=85";
import cbdExplainer from "./assets/screens/cbd-explainer-light.png?w=720&format=webp&quality=85";

// The eight-section structure from CASE-STUDY-PLAN.md. Still to come:
// Research detail from Dara (the bracketed callouts), the screenshots (the
// dashed placeholders), and the physio review's results (Validation).

// the questions the project answers: set out in The problem, and again in
// its TL;DR, each linking to the part of The solution that answers it
const questions = [
  [
    "How might we give people a clear pre- and post-surgery plan without relying entirely on physio access?",
    ["06.01", "06.02"],
  ],
  [
    "How might we keep people motivated when progress is slow and difficult to see?",
    ["06.03"],
  ],
  [
    "How might we make treatment options clear from the moment someone is diagnosed?",
    ["06.01"],
  ],
];

export default function Cruciate() {
  return (
    <CaseStudyLayout
      numbered
      sections={[
        { id: "overview", label: "Overview" },
        { id: "problem", label: "The problem" },
        { id: "research", label: "Research" },
        { id: "insights", label: "Insights" },
        { id: "exploration", label: "Exploration" },
        { id: "solution", label: "The solution" },
        { id: "validation", label: "Validation" },
        { id: "outcomes", label: "Outcomes" },
      ]}
    >
      <CaseStudyPage>
        <ViewToggle />

        <CaseStudySection id="overview" title="Overview" tldrVisible>
          <Paragraph>
            The anterior cruciate ligament (ACL) is one of the main ligaments holding the knee
            together, and tearing it often means surgery and months of rehab. That rehab is a long
            process of changing exercises, restrictions and milestones.
          </Paragraph>
          <Paragraph>
            Cruciate is a mobile-first rehab companion that brings your recovery timeline, daily
            exercises and progress into one place, with safety checks built in. I designed and built
            it, to find out whether a structured daily plan could make recovery easier to follow and
            progress easier to see.
          </Paragraph>
          <Facts
            items={[
              ["Role", "Design & Development"],
              ["Year", "2026"],
              ["Sector", "Health"],
              ["Team", "Solo"],
              ["Tools", "Figma, React, TypeScript, Supabase, Claude Code, GitHub"],
            ]}
          />
        </CaseStudySection>

        <CaseStudySection
          id="problem"
          title="The problem"
          tldr={
            <>
              <Paragraph>
                I tore my ACL playing tag rugby, with no health insurance, and had to find every next
                step myself: the MRI, the referral, and later my treatment options. Recovery depends
                on guidance most people only get from a physio. Without it, I was left without a
                plan, without a clear sense of progress, and without knowing my options.
              </Paragraph>
              <Questions items={questions} />
            </>
          }
        >
          <Paragraph>In 2026, I tore my ACL playing tag rugby. I didn&apos;t have health insurance.</Paragraph>
          <Paragraph>
            At the hospital, with a swollen knee, I had an X-ray and some manual tests, and was told
            it wasn&apos;t my ACL.
          </Paragraph>
          <Paragraph>
            A month later, I paid for an MRI at a private clinic. The report showed I&apos;d fully
            torn my ACL and damaged my meniscus.
          </Paragraph>
          <Paragraph>
            Then nothing. The report didn&apos;t come with a next step. I went to my GP and asked for
            a referral for surgery myself, and joined a long wait.
          </Paragraph>
          <Paragraph>
            The obvious answer is a physio. But paying privately for regular physio across months of
            recovery adds up fast. I was left with little guidance on how to prepare or what to do in
            the meantime, and progress so slow it was hard to tell whether any of it was working.
          </Paragraph>
          <Paragraph>
            Only later did I find out about the EU Cross-Border Healthcare Directive, which can allow
            Irish patients to have treatment elsewhere in the EU and claim the cost back from the HSE.
          </Paragraph>
          <Paragraph>
            Every next step, I&apos;d had to find myself. That made me realise the gap wasn&apos;t
            just access to surgery. It was everything around
            it: a plan to follow, guidance between appointments, and enough information to
            understand the options.
          </Paragraph>
          <Paragraph>
            <strong>The problem:</strong> recovering from an ACL injury depends on guidance most
            people only get from a physio. Without it, people are left without a plan, without a
            clear sense of progress, and without knowing their options.
          </Paragraph>
          <Paragraph>
            <strong>Who it&apos;s for:</strong> people waiting for or recovering from ACL surgery,
            especially those without private care or regular access to a physio.
          </Paragraph>
          <Subheading>The questions this project answers</Subheading>
          <Questions items={questions} />
        </CaseStudySection>

        <CaseStudySection
          id="research"
          title="Research"
          tldr="I'm not a physio, but ACL rehab is well documented, just scattered. People who'd been through surgery kept naming the same six priorities, in order: prehab, reducing the swelling, range of motion, walking properly, strength, and loading without fear. Curovate, the closest app, is a paid clinical programme that doesn't cover getting treatment. Seven published studies back the approach."
        >
          <Paragraph>
            I&apos;m not a physio. But ACL injuries are common, and their rehab is well documented.
            The information exists. It&apos;s just scattered. Cruciate curates it into one place.
          </Paragraph>

          <SubSection number={1} title="People who've been through it">
            <Paragraph>
              On Reddit and Instagram, people who&apos;d had ACL surgery shared what got them back and
              what they&apos;d do differently. Six things came up again and again, in the order
              recovery happens:
            </Paragraph>
            <Steps
              items={[
                {
                  title: "Do prehab",
                  body: "Get the knee as strong and mobile as you can before surgery.",
                  inApp: "a prehab track for the wait before surgery.",
                },
                {
                  title: "Reduce the swelling",
                  body: "Swelling holds everything else back, so it comes first.",
                  inApp: "ankle pumps from day one, and controlled swelling as a milestone.",
                },
                {
                  title: "Restore range of motion",
                  body: "Straightening the knee fully (extension), then bending it (flexion).",
                  inApp: "extension exercises first, and range of motion logged after sessions.",
                },
                {
                  title: "Walk properly",
                  body: "Heel to toe, with a normal gait and no limp.",
                  inApp: "walking without a limp is a milestone before you move on.",
                },
                {
                  title: "Build strength",
                  body: "In the muscles around the knee, mostly the quads, to protect it.",
                  inApp: "from quad sets to single-leg work, phase by phase.",
                },
                {
                  title: "Load it without fear",
                  body: "Trusting the knee again is as hard as strengthening it.",
                  inApp: "load unlocked step by step, so you know when it's safe.",
                },
              ]}
            />
            <Paragraph>
              None of it was new. It was just spread across posts and videos, in no order, with
              nothing to say what to do today.
            </Paragraph>
          </SubSection>

          <SubSection number={2} title="An existing app: Curovate">
            <Paragraph>
              Curovate, the closest app, is a full clinical programme built by a physical therapist,
              and its phone-based range-of-motion measurement beats anything in Cruciate. But
              it&apos;s a subscription ($12.99 a month), physio sessions cost extra, and it
              doesn&apos;t cover how to get treatment. So Cruciate went narrower: free, a plan and a
              tracker, plus the Irish treatment options.
            </Paragraph>
          </SubSection>

          <SubSection number={3} title="Where the exercises come from">
            <Paragraph>
              Every exercise comes from published rehab guidance, adapted to Cruciate&apos;s nine
              phases: Jeremy Burnham MD&apos;s phase-by-phase ACL rehab guide, The [P]rehab
              Guys&apos; pre-surgery exercise guide, and Brigham and Women&apos;s Hospital&apos;s ACL
              reconstruction protocol.
            </Paragraph>
          </SubSection>

          <SubSection
            number={4}
            title="Checking the approach against the research"
            summary="Before publishing, I checked the app's main decisions against published studies."
          >
            <Sources
              items={[
                {
                  finding:
                    "A structured home programme with few physio sessions got more people to acceptable range of motion in the first three months than standard physio.",
                  cite: "Grant et al. (2005), American Journal of Sports Medicine",
                  href: "https://doi.org/10.1177/0363546504273051",
                  inApp: "a daily plan to follow at home.",
                },
                {
                  finding:
                    "Six weeks of prehab improved knee function, still there 12 weeks after surgery.",
                  cite: "Shaarani et al. (2013), American Journal of Sports Medicine",
                  href: "https://doi.org/10.1177/0363546513493594",
                  inApp: "the prehab phases.",
                },
                {
                  finding:
                    "Extra prehab meant better function two years on, and more people back in sport (72% against 63%).",
                  cite: "Failla et al. (2016), American Journal of Sports Medicine",
                  href: "https://doi.org/10.1177/0363546516652594",
                  inApp: "the prehab track.",
                },
                {
                  finding:
                    "Full extension from day one helps avoid stiffness and a lasting loss of extension.",
                  cite: "Shelbourne & Nitz (1990), American Journal of Sports Medicine",
                  href: "https://doi.org/10.1177/036354659001800313",
                  inApp: "extension first, as the first milestone.",
                },
                {
                  finding:
                    "Move on when you meet measurable criteria, not after a set number of weeks.",
                  cite: "Adams et al. (2012), Journal of Orthopaedic & Sports Physical Therapy",
                  href: "https://doi.org/10.2519/jospt.2012.3871",
                  inApp: "milestone check-ins.",
                },
                {
                  finding:
                    "Across 7,556 people, only 65% got back to their pre-injury level of sport. A positive psychological response helped.",
                  cite: "Ardern et al. (2014), British Journal of Sports Medicine",
                  href: "https://doi.org/10.1136/bjsports-2013-093398",
                  inApp: "load unlocked step by step, and a last phase for confidence.",
                },
                {
                  finding:
                    "Reinjury risk roughly halved for each month return to sport was delayed, up to nine months.",
                  cite: "Grindem et al. (2016), British Journal of Sports Medicine",
                  href: "https://doi.org/10.1136/bjsports-2016-096031",
                  inApp: "the app never clears you to play.",
                },
              ]}
            />
          </SubSection>

          <Paragraph>
            <strong>Where more research is needed:</strong> nobody else has used the app yet, and
            what I learned about other people&apos;s recovery is second-hand. Validation below sets
            out how that changes.
          </Paragraph>
        </CaseStudySection>

        <CaseStudySection
          id="insights"
          title="Insights"
          tldr={
            <>
              <Paragraph>Five insights, each turned into a design decision:</Paragraph>
              <List>
                <li>
                  <strong>People need today&apos;s step, not the whole protocol.</strong> A daily
                  checklist inside a phase roadmap.
                </li>
                <li>
                  <strong>People know what matters, but not the order, or when they&apos;re
                  ready.</strong> Phases in recovery order, with milestone check-ins.
                </li>
                <li>
                  <strong>Slow progress needs to be visible.</strong> Range-of-motion logging and
                  trend charts.
                </li>
                <li>
                  <strong>A self-guided app has to know when to stop you.</strong> A symptom check,
                  and load unlocked only once you&apos;re cleared.
                </li>
                <li>
                  <strong>Treatment options matter most at diagnosis.</strong> The Cross-Border
                  Directive in onboarding.
                </li>
              </List>
            </>
          }
        >
          <Paragraph>
            Each is marked evidence (from research or my own recovery) or hypothesis (my own
            reasoning, still to test).
          </Paragraph>
          <Insights
            rows={[
              {
                tag: "evidence",
                source: "My own recovery",
                finding: <p>My MRI came with a diagnosis but no next step, and no plan for the wait.</p>,
                insight: <p>People need today&apos;s step and where it leads, not the whole protocol.</p>,
                response: <p>A phase roadmap for the long view, and a checklist for today.</p>,
              },
              {
                tag: "evidence",
                source: "Reddit and Instagram, the clinical guides, Adams et al. (2012)",
                finding: (
                  <p>People agree on what matters, and protocols move you on by milestones, not weeks.</p>
                ),
                insight: <p>What&apos;s missing is the order, and a way to know when you&apos;re ready.</p>,
                response: <p>Phases in recovery order, with milestone check-ins to move on.</p>,
              },
              {
                tag: "hypothesis",
                source: "My own recovery",
                finding: <p>Range of motion improves a few degrees at a time, too slowly to notice.</p>,
                insight: <p>When progress is invisible, motivation fades.</p>,
                response: <p>Range-of-motion logging, trend charts and a session history.</p>,
              },
              {
                tag: "hypothesis",
                source: "My own reasoning",
                finding: (
                  <p>Some symptoms after surgery mean stop, and load is only safe once you&apos;re cleared.</p>
                ),
                insight: <p>A self-guided app has to know when to say no.</p>,
                response: (
                  <p>A symptom check before each session, and load locked until you&apos;re cleared.</p>
                ),
              },
              {
                tag: "evidence",
                source: "My own recovery",
                finding: <p>I only found the Cross-Border Directive after I&apos;d started waiting.</p>,
                insight: <p>Treatment options matter most at diagnosis.</p>,
                response: <p>One onboarding question, and an explainer linking to the HSE.</p>,
              },
            ]}
          />
        </CaseStudySection>

        <CaseStudySection
          id="exploration"
          title="Exploration"
          tldr="Designed in code, so the version history shows the real iterations: the knee diagram went from a stick figure to an illustrated body, the symptom checklist became one question, and one long home screen split into tabs."
        >
          <Paragraph>
            I designed Cruciate in code, so there are no sketches from the time. Its version history
            shows the real iterations instead.
          </Paragraph>
          <SubSection number={1} title="The knee diagram">
            <Paragraph>
              Range of motion started as two plain number inputs. It became sliders with a knee
              diagram that bends as you drag, and the diagram went through four versions.
            </Paragraph>
            <Figures columns={2} phoneColumns={1}>
              <Figure
                src={kneeHinge}
                alt="A stick-figure knee diagram: head, knee and foot drawn as lines, at five angles"
                caption="1. A stick-figure hinge"
                size="wide"
              />
              <Figure
                src={kneeFirst}
                alt="An illustrated person lying on the floor, bending one knee, at six angles"
                caption="2. A first illustrated body"
                size="wide"
              />
              <Figure
                src={kneeFinal}
                alt="The refined illustration, facing the other way, at eight angles from 0 to 150 degrees"
                caption="3. Refined: new colours, turned around, more angles"
                size="wide"
              />
              <Figure
                src={kneeCheckIn}
                alt="Two check-in questions, each with the illustration above a slider reading 12 degrees from straight and 95 degrees bend"
                caption="4. In the check-in, above each slider"
                size="wide"
              />
            </Figures>
            <Paragraph>
              Building it exposed a real error: the chart treated a higher extension number as
              better, but 0° (fully straight) is the goal. The chart now flips that line.
            </Paragraph>
          </SubSection>
          <BeforeAfter
            number={2}
            title="The symptom check"
            before="Always-visible red-flag checklist: add screenshot"
            after={{
              src: symptomsQuestion,
              alt: "Today's rehab opens with one question: any symptoms today?",
            }}
            note={
              <p>
                The always-visible red-flag checklist became one question. The list only appears if
                you answer yes, so on most days it&apos;s out of the way.
              </p>
            }
          />
          <BeforeAfter
            number={3}
            title="The home screen"
            before="One long scrolling home: add screenshot"
            after={{
              src: homeScreen,
              alt: "Home: complete today's rehab, then the current phase and what it takes to move on",
            }}
            note={
              <p>
                One long scrolling screen split into four tabs. Home now leads with your phase, how
                close you are to the next, and today&apos;s rehab.
              </p>
            }
          />
        </CaseStudySection>

        <CaseStudySection
          id="solution"
          title="The solution"
          tldr={
            <>
              <List>
                <li>
                  <strong>A long recovery made manageable (06.01):</strong> onboarding sets your
                  timeline, and Home shows your phase and what it takes to move on.
                </li>
                <li>
                  <strong>A plan turned into a daily action (06.02):</strong> today&apos;s exercises
                  as a checklist, with timers for holds.
                </li>
                <li>
                  <strong>Progress made visible (06.03):</strong> range-of-motion logging and trend
                  charts.
                </li>
                <li>
                  <strong>Safety without a clinician (06.04):</strong> a symptom check before every
                  session, and load unlocked only once you&apos;re cleared.
                </li>
              </List>
              <Figures columns={4}>
                <Figure src={homeScreen} alt="Home: today's rehab, and the current phase" caption="Home" />
                <Figure
                  src={todaysRehab}
                  alt="Today's rehab: each exercise with sets to tick off or a hold timer"
                  caption="Today's rehab"
                />
                <Figure
                  src={romTrend}
                  alt="Range-of-motion trend: extension and flexion both improved over six weeks"
                  caption="Progress"
                />
                <Figure
                  src={symptomsQuestion}
                  alt="Any symptoms today? No or yes"
                  caption="The symptom check"
                />
              </Figures>
            </>
          }
        >
          <Challenge
            number={1}
            title="Making a long recovery feel manageable"
            summary="A recovery of nine months or more, broken into phases you can see the end of."
            work={
              <p>
                Onboarding puts you on a prehab or rehab track, timed from your surgery date. Home
                shows your phase and what it takes to move on, and the Phases tab is the roadmap.
              </p>
            }
          >
            <Figures columns={4}>
              <Figure
                src={onboardingSurgery}
                alt="Onboarding: is surgery on the calendar? Scheduled, still deciding or no date yet, with a date picker"
                caption="Onboarding sets the timeline"
              />
              <Figure
                src={checkInComplete}
                alt="Check-in complete: you're starting at Phase 1, ROM restoration, with what it takes to move on"
                caption="A check-in places you in a phase"
              />
              <Figure
                src={homeScreen}
                alt="Home: complete today's rehab, then the current phase with its milestones, days until surgery, weeks since injury, and what it takes to move on"
                caption="Home: where you are, and what's next"
              />
              <Figure
                src={phasesScreen}
                alt="The Phases tab: a roadmap of four prehab phases, each with its goal to move on"
                caption="The roadmap, phase by phase"
              />
            </Figures>
            <Subheading>Your options, from day one</Subheading>
            <Paragraph>
              Before surgery, onboarding asks whether you&apos;ve heard of the Cross-Border
              Healthcare Directive. If not, it explains it and the NTPF, linking to the official
              pages rather than giving advice.
            </Paragraph>
            <Figures columns={2}>
              <Figure
                src={cbdQuestion}
                alt="Onboarding question: have you heard of the Cross-Border Healthcare Directive?"
                caption="One question during onboarding"
              />
              <Figure
                src={cbdExplainer}
                alt="Your options: a plain-English explainer of the Cross-Border Directive and the NTPF, with links to both"
                caption="The explainer, linking to the official pages"
              />
            </Figures>
          </Challenge>

          <Challenge
            number={2}
            title="Turning a rehab plan into a daily action"
            summary="Open the app, do today's exercises, log them, done."
            work={
              <p>
                A quick symptom check, then the phase&apos;s exercises in one list, with cues and
                timers for holds. Logging the session ends with a short celebration and a
                range-of-motion check.
              </p>
            }
          >
            <Figures columns={3}>
              <Figure
                src={todaysRehab}
                alt="Today's rehab: no symptoms today, 0 of 9 complete, each exercise with sets to tick off or a hold timer, Mark all done, and Log session"
                caption="Today's exercises: tick sets off, or time the holds"
              />
              <Figure
                src={sessionCelebration}
                alt="Logging the session: a full-card celebration reading Consistency wins!"
                caption="Logging the session is celebrated"
              />
              <Figure
                src={romLogged}
                alt="Range of motion logged, with a link to your progress and a prompt: ready to check your progress? Answer a quick check-in to see if you're ready to advance"
                caption="Then a reading, and a nudge to check in"
              />
            </Figures>
          </Challenge>

          <Challenge
            number={3}
            title="Making gradual progress visible"
            summary="A few degrees a week is real progress, if you can see it."
            work={
              <p>
                Sliders with a live knee diagram show how to take each reading. Progress opens in
                plain words (&ldquo;Flexion has improved 15° since 6 weeks ago&rdquo;), then charts
                where up always means better, and a calendar of every session.
              </p>
            }
          >
            <Figures columns={4}>
              <Figure
                src={romExtension}
                alt="How much can you straighten your knee right now? An illustration lying flat above a slider reading 0 degrees from straight"
                caption="Logging extension: lying flat, in degrees from straight"
              />
              <Figure
                src={romFlexion}
                alt="How far can you bend your knee right now? An illustration of a heel slide above a slider reading 120 degrees bend"
                caption="Logging flexion: the diagram bends with the slider"
              />
              <Figure
                src={romTrend}
                alt="Range-of-motion trend: extension has improved 4 degrees and flexion 15 degrees since six weeks ago, with a chart for each where up means better"
                caption="Progress in plain words, then the trend"
              />
              <Figure
                src={calendarScreen}
                alt="A calendar of the month: rounds done each day, missed days, and today's round in progress"
                caption="Every session, day by day"
              />
            </Figures>
            <Subheading>Knowing when you&apos;re ready</Subheading>
            <Paragraph>
              Progress also means knowing when to move on. A milestone check-in asks the
              phase&apos;s own criteria, one question at a time, and explains what counts, so a
              yes means something.
            </Paragraph>
            <Figures columns={3}>
              <Figure
                src={checkinQ1}
                alt="Milestone check-in, question 1 of 3: can you do a straight leg raise without lag? With an explanation of what lag looks like"
                caption="1. A straight leg raise, without lag"
              />
              <Figure
                src={checkinQ2}
                alt="Question 2 of 3: can you hold a quad set for 10 seconds with a visible contraction? With what visible means"
                caption="2. A 10-second quad set"
              />
              <Figure
                src={checkinQ3}
                alt="Question 3 of 3: does your swelling stay controlled during and after these exercises?"
                caption="3. Swelling that stays controlled"
              />
            </Figures>
          </Challenge>

          <Challenge
            number={4}
            title="Designing for safety without a clinician in the room"
            summary="An app giving exercises after surgery has to be careful about when it says yes."
            work={
              <p>
                A waiver before you start, and &ldquo;Any symptoms today?&rdquo; before every
                session: a red flag pauses the day. Loaded exercises stay locked until you&apos;re
                cleared, and the app never clears you to play. That&apos;s your surgeon&apos;s call.
              </p>
            }
          >
            <Figures columns={3}>
              <Figure
                src={symptomsQuestion}
                alt="Today's rehab opens with one question: any symptoms today? No or yes"
                caption="1. One question before each session"
              />
              <Figure
                src={symptomsWhich}
                alt="Which of these? Fever, calf pain or swelling, chest pain or shortness of breath, sudden severe pain, a wound that's red, warm, swollen or draining, can't bear weight"
                caption="2. The list, only if you answer yes"
              />
              <Figure
                src={symptomsPaused}
                alt="Contact your care team before continuing: today's exercises are paused"
                caption="3. A red flag pauses the day"
              />
            </Figures>
            <Figures columns={3}>
              <Figure
                src={waiverScreen}
                alt="Before you start: Cruciate is a self-tracking tool, not medical care, with a waiver to agree to"
                caption="A waiver before you start"
              />
              <MediaPlaceholder>Locked exercise: add screenshot</MediaPlaceholder>
            </Figures>
          </Challenge>
        </CaseStudySection>

        <CaseStudySection
          id="validation"
          title="Validation"
          tldr="Not tested with anyone else yet, and not released publicly because of legal concerns. Five success criteria are set: a physio review comes first, then people who've had ACL surgery."
        >
          <Paragraph>
            Cruciate isn&apos;t released publicly yet, because of legal concerns about giving
            exercise guidance after surgery, and nobody else has tested it. These are the criteria
            it will be tested against.
          </Paragraph>
          <Criteria
            rows={[
              [
                "People understand today's plan",
                "Ask them to find their next exercises without help",
              ],
              [
                "People can log a measurement",
                "Watch whether they complete a range-of-motion entry correctly",
              ],
              ["People understand their progress", "Ask them to read their trend chart"],
              [
                "People know what to do on a red flag",
                "Show a red-flag state and ask what they'd do next",
              ],
              [
                "People come back to the plan",
                "Repeat sessions and weekly use, once there's real usage",
              ],
            ]}
          />
          <Subheading>The plan</Subheading>
          <List>
            <li>
              <strong>A physio review first.</strong> A physio works through the first four tasks
              and checks the phases and safety rules against their own practice. I&apos;ll note what
              confused them, and change at least one thing because of it.
            </li>
            <li>
              <strong>Then people who&apos;ve had ACL surgery.</strong> Two or three doing the same
              tasks.
            </li>
          </List>
        </CaseStudySection>

        <CaseStudySection
          id="outcomes"
          title="Outcomes and learnings"
          tldr="A working app, not yet released publicly. Designing in code caught a real error a mockup wouldn't have, but left no record of the alternatives. Next: a physio review, testing with people who've had ACL surgery, and a legal review before release."
        >
          <Closing
            outcome={
              <p>
                A working app, with two tracks, nine phases and an exercise library drawn from
                published protocols. It isn&apos;t released publicly yet. [Whether you use it
                yourself, and since when.]
              </p>
            }
            learned={
              <ul>
                <li>
                  Designing with real data finds real problems: the backwards extension chart only
                  showed up once readings were being logged.
                </li>
                <li>
                  Designing in code leaves no record of the options I didn&apos;t take. Next time,
                  I&apos;d sketch the alternatives before building one.
                </li>
              </ul>
            }
            next={
              <ul>
                <li>The physio review, and the changes it leads to.</li>
                <li>Testing with people who&apos;ve had ACL surgery.</li>
                <li>A legal review before a public release.</li>
              </ul>
            }
          />
          <Callout>[Once the physio review is done: what they found, and what changed.]</Callout>
          <LiveLink href="https://cruciate.vercel.app/" target="_blank" rel="noopener noreferrer">
            Visit Cruciate <FiExternalLink aria-hidden="true" />
          </LiveLink>
        </CaseStudySection>
      </CaseStudyPage>

      <MoreWork currentProjectId="cruciate" />
    </CaseStudyLayout>
  );
}
