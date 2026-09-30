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
} from "../../components/case-study/Process";
import MoreWork from "../../components/case-study/MoreWork";
import ViewToggle from "../../components/case-study/ViewToggle";
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
                After tearing my ACL, I found that recovery depends on guidance most people only get
                from a physio. Without private care, I was left waiting for surgery without a plan,
                without a clear sense of progress, and without knowing my options.
              </Paragraph>
              <Questions items={questions} />
            </>
          }
        >
          <Paragraph>In 2026, I tore my ACL and meniscus.</Paragraph>
          <Paragraph>
            The diagnosis was clear. An X-ray and MRI showed exactly what was wrong. What came next
            wasn&apos;t.
          </Paragraph>
          <Paragraph>
            The obvious answer is a physio. But without private health insurance, I faced a long
            wait for surgery, and paying privately for regular physio across months of recovery adds
            up fast. I was left with little guidance on how to prepare, what my options were, or
            what to do in the meantime, and progress so slow it was hard to tell whether any of it
            was working.
          </Paragraph>
          <Paragraph>
            Then I discovered the EU Cross-Border Healthcare Directive, which can allow Irish
            patients to have treatment elsewhere in the EU and claim the cost back from the HSE.
          </Paragraph>
          <Paragraph>
            That made me realise the gap wasn&apos;t just access to surgery. It was everything around
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
          tldr="Desk research and conversations rather than formal interviews: advice from a physio, other ACL patients, a review of other rehab apps, and published rehab protocols."
        >
          <Paragraph>
            I didn&apos;t run formal interviews. The research came from four places, alongside my own
            recovery.
          </Paragraph>
          <List>
            <li>
              <strong>Physio advice.</strong> [What they told you that shaped the app.]
            </li>
            <li>
              <strong>Other ACL patients.</strong> [Where you heard from them, and what kept coming
              up.]
            </li>
            <li>
              <strong>Other rehab apps.</strong> [Which ones, and what each got wrong or left out.]
            </li>
            <li>
              <strong>Published rehab protocols.</strong> The phases, the criteria for moving between
              them and the exercise library all come from published ACL protocols. [Which ones.]
            </li>
          </List>
          <Paragraph>
            <strong>Where more research is needed:</strong> nobody else has used the app yet, so
            everything I learned about other people&apos;s recovery is second-hand. Validation below
            sets out how that changes.
          </Paragraph>
        </CaseStudySection>

        <CaseStudySection
          id="insights"
          title="Insights"
          tldr="Five insights shaped the design: people need today's step, not the whole protocol; progress is measured by milestones, not weeks; slow progress needs to be made visible; a self-guided app has to know when to stop you; and treatment options matter most at diagnosis."
        >
          <Paragraph>
            Each insight is marked as evidence, where it came from research or my own recovery, or
            as a hypothesis, where it came from my own reasoning and still needs testing.
          </Paragraph>
          <Insights
            rows={[
              {
                tag: "evidence",
                source: "My own recovery",
                finding: (
                  <p>
                    After diagnosis I had a surgery date and a long wait, but no plan for the weeks in
                    between.
                  </p>
                ),
                insight: (
                  <p>
                    People don&apos;t need the whole protocol at once. They need to know what to do
                    today, and where it leads.
                  </p>
                ),
                response: (
                  <p>
                    Recovery is built around the surgery date: a phase roadmap for the long view, and
                    a checklist for today.
                  </p>
                ),
              },
              {
                tag: "evidence",
                source: "Published rehab protocols",
                finding: (
                  <p>
                    Protocols move you on when you meet criteria, like flexion past 120° or a straight
                    leg raise with no lag, not after a set number of weeks.
                  </p>
                ),
                insight: (
                  <p>
                    Progress in rehab means meeting milestones, so people need a way to measure
                    themselves against them.
                  </p>
                ),
                response: (
                  <p>
                    Range-of-motion logging, and milestone check-ins that ask the protocol&apos;s own
                    questions before you move phase.
                  </p>
                ),
              },
              {
                tag: "hypothesis",
                source: "[Other ACL patients, if they backed this up]",
                finding: (
                  <p>
                    Knee range of motion improves by a few degrees at a time, too slowly to notice
                    day to day.
                  </p>
                ),
                insight: (
                  <p>
                    When progress is invisible, motivation fades, and repetitive exercises are the
                    first thing to go.
                  </p>
                ),
                response: (
                  <p>
                    Trend charts, a comparison with your last reading after each session, a session
                    history, and a moment of celebration when you log a session.
                  </p>
                ),
              },
              {
                tag: "hypothesis",
                source: "[Physio advice, if it backed this up]",
                finding: (
                  <p>
                    After surgery, some symptoms mean stop and call your care team, and loaded
                    exercises are only safe once you&apos;re cleared for them.
                  </p>
                ),
                insight: (
                  <p>
                    A self-guided app has to know when to say no. It supports clinical advice, it
                    can&apos;t replace it.
                  </p>
                ),
                response: (
                  <p>
                    A symptom check before each session, loaded exercises locked until you&apos;re
                    cleared, and a waiver before you start.
                  </p>
                ),
              },
              {
                tag: "evidence",
                source: "My own recovery",
                finding: (
                  <p>
                    I only found out about the Cross-Border Healthcare Directive after I&apos;d
                    already started waiting.
                  </p>
                ),
                insight: (
                  <p>
                    Treatment options matter most at diagnosis, when the wait begins, not months
                    later.
                  </p>
                ),
                response: (
                  <p>
                    One onboarding question about the Directive, and a plain-English explainer that
                    links to the HSE&apos;s own page.
                  </p>
                ),
              },
            ]}
          />
        </CaseStudySection>

        <CaseStudySection
          id="exploration"
          title="Exploration"
          tldr="Cruciate was designed in code, so its version history shows the real iterations: range of motion moved from number inputs to sliders with a live knee diagram, the symptom checklist became a single question, and one long home screen split into tabs."
        >
          <Paragraph>
            I designed Cruciate in code, iterating with Claude Code, so there are no sketches from
            the time. The app&apos;s version history shows the real iterations instead. Three changed
            the design the most.
          </Paragraph>
          <SubSection number={1} title="The knee diagram">
            <Paragraph>
              The first version of range-of-motion logging asked for two plain numbers, with nothing
              to show what they meant. It became two sliders limited to realistic clinical ranges,
              each with a knee diagram that bends as you drag, positioned the way you take the
              reading. The diagram went through four versions.
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
              Building it exposed a real error. The chart treated a higher extension number as
              better, but extension is measured as a deficit: 0° means fully straight, which is the
              goal. The chart now flips that line, so up means better on both.
            </Paragraph>
          </SubSection>
          <BeforeAfter
            number={2}
            title="The symptom check"
            before="Always-visible red-flag checklist: add screenshot"
            after="One yes/no question: add screenshot"
            note={
              <p>
                The red-flag checklist was always on screen above the exercises. It became one
                question, &ldquo;Any symptoms today?&rdquo;, and the list only appears if the answer
                is yes. On most days the answer is no, and the check no longer stands between you and
                your exercises.
              </p>
            }
          />
          <BeforeAfter
            number={3}
            title="The home screen"
            before="One long scrolling home: add screenshot"
            after="Home with the phase card: add screenshot"
            note={
              <p>
                Everything started on one long scrolling screen. It split into separate screens,
                then a tab bar: Home, Phases, Progress and Settings. Home now leads with where you
                are: your phase, how close you are to the next one, and the button to start
                today&apos;s rehab, above the fold.
              </p>
            }
          />
          <SubSection number={4} title="Also dropped">
            <List>
              <li>
                <strong>Weight, reps and effort inputs on every exercise.</strong> Replaced by ticking
                exercises off, with timers for holds.
              </li>
              <li>
                <strong>A button to override a failed milestone check-in.</strong> Replaced by a
                single Continue. You can still change phase from the Phases tab, as a deliberate
                choice.
              </li>
              <li>
                <strong>A daily &ldquo;cleared for loading&rdquo; checkbox.</strong> Clearance comes
                from your surgeon or physio once, not every day, so it moved to your profile.
              </li>
            </List>
          </SubSection>
        </CaseStudySection>

        <CaseStudySection
          id="solution"
          title="The solution"
          tldr="Four design challenges: making a long recovery feel manageable, turning a rehab plan into a daily action, making gradual progress visible, and designing for safety when there's no clinician in the room."
        >
          <Challenge
            number={1}
            title="Making a long recovery feel manageable"
            summary="A recovery of nine months or more, broken into phases you can see the end of."
            tag="evidence"
            insight={<p>People need today&apos;s step and where it leads, not the whole protocol.</p>}
            work={
              <>
                <p>
                  Onboarding asks where you are: waiting for surgery, or recovering from it. That
                  puts you on one of two tracks, four prehab phases before surgery or five rehab
                  phases after, and your surgery date sets the weeks since.
                </p>
                <p>
                  Home shows your current phase, how far through it you are, and what you need to
                  do to move on. The Phases tab is the roadmap: every phase, its exercises and
                  equipment, and where you are on it.
                </p>
              </>
            }
          >
            <MediaRow>
              <MediaPlaceholder>Onboarding: add screenshot</MediaPlaceholder>
              <MediaPlaceholder>Home and the Phases roadmap: add screenshot</MediaPlaceholder>
            </MediaRow>
            <Subheading>Your options, from day one</Subheading>
            <Paragraph>
              Before surgery, onboarding asks one more question: have you heard of the Cross-Border
              Healthcare Directive? If not, a short explainer follows, with the National Treatment
              Purchase Fund as a second option. The app links to the HSE and NTPF&apos;s own pages
              rather than giving advice itself, and it stays available from your profile.
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
            tag="evidence"
            insight={<p>A plan only helps if it tells you what to do today.</p>}
            work={
              <>
                <p>
                  Today&apos;s rehab starts with a quick symptom check, then lists the phase&apos;s
                  exercises in one stack, mobility and strength. Each has instructions and cues, and
                  holds like quad sets get a built-in timer. Tick them off one by one or mark them
                  all done.
                </p>
                <p>
                  Logging the session is marked with a short celebration, then leads straight into a
                  range-of-motion check.
                </p>
              </>
            }
          >
            <MediaRow>
              <MediaPlaceholder>Today&apos;s rehab: add screenshot</MediaPlaceholder>
              <MediaPlaceholder>Completed session: add screenshot</MediaPlaceholder>
            </MediaRow>
          </Challenge>

          <Challenge
            number={3}
            title="Making gradual progress visible"
            summary="A few degrees a week is real progress, if you can see it."
            tag="hypothesis"
            insight={<p>When progress is invisible, motivation fades.</p>}
            work={
              <>
                <p>
                  Range of motion is the number that matters most, so it gets its own flow. Sliders
                  with a live knee diagram show how to take each reading, and the result is compared
                  with your last one straight away.
                </p>
                <p>
                  Trend charts show extension and flexion over time, both drawn so up means better.
                  A calendar and history keep a record of every session.
                </p>
              </>
            }
          >
            <MediaRow>
              <MediaPlaceholder>Range-of-motion logging: add screenshot</MediaPlaceholder>
              <MediaPlaceholder>Progress chart: add screenshot</MediaPlaceholder>
              <MediaPlaceholder>History: add screenshot</MediaPlaceholder>
            </MediaRow>
          </Challenge>

          <Challenge
            number={4}
            title="Designing for safety without a clinician in the room"
            summary="An app giving exercises after surgery has to be careful about when it says yes."
            tag="hypothesis"
            insight={<p>A self-guided app supports clinical advice. It can&apos;t replace it.</p>}
            work={
              <>
                <p>
                  You read and agree to a waiver before you start. Each session begins with
                  &ldquo;Any symptoms today?&rdquo; Flag something concerning, such as chest pain or
                  a wound that looks infected, and that day&apos;s exercises pause with a prompt to
                  contact your care team.
                </p>
                <p>
                  Loaded exercises stay locked until you mark yourself cleared in your profile, with
                  a link there from the locked exercise. Milestone check-ins ask the protocol&apos;s
                  own questions before you move on, and the last phase says plainly that the app
                  doesn&apos;t clear you to play: that call is your surgeon&apos;s or physio&apos;s.
                </p>
              </>
            }
          >
            <MediaRow>
              <MediaPlaceholder>Symptom check-in: add screenshot</MediaPlaceholder>
              <MediaPlaceholder>Red-flag warning: add screenshot</MediaPlaceholder>
              <MediaPlaceholder>Locked exercise: add screenshot</MediaPlaceholder>
            </MediaRow>
          </Challenge>
        </CaseStudySection>

        <CaseStudySection
          id="validation"
          title="Validation"
          tldr="Not tested with other people yet: Cruciate isn't released publicly because of legal concerns. A physio review with four set tasks comes first, then people who've had ACL surgery."
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
          tldr="A working app, not yet released. Designing in code surfaced a real logic error a mockup wouldn't have, but left no record of the alternatives. Next: the physio review, then patient testing."
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
