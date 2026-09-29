import { FiExternalLink } from "react-icons/fi";
import { CaseStudyLayout, CaseStudyPage, CaseStudySection } from "../../components/case-study/Index";
import {
  Paragraph,
  List,
  PillRow,
  Pill,
  Callout,
  LiveLink,
  MediaPlaceholder,
  MediaRow,
} from "../../components/case-study/Prose";
import OtherProjects from "../../components/shared/OtherProjects";

// Draft: written from the project's own product brief (Plan.txt) and what
// the shipped app does. Screens and real numbers still to add.

export default function PintsYurt() {
  return (
    <CaseStudyLayout
      sections={[
        { id: "overview", label: "Overview" },
        { id: "question", label: "The question" },
        { id: "principles", label: "Principles" },
        { id: "price", label: "Community price" },
        { id: "build", label: "Building it" },
        { id: "outcomes", label: "Outcomes" },
      ]}
    >
      <CaseStudyPage>
        <CaseStudySection id="overview" title="Overview" tldrVisible>
          <Paragraph>
            Pints Yurt is a community-powered map of pint prices across Limerick. Open it and the
            cheapest pints nearby are right there on the map, reported and confirmed by the people
            drinking them.
          </Paragraph>
          <PillRow>
            <Pill>Product design</Pill>
            <Pill>Mobile-first web app</Pill>
            <Pill>React + TypeScript</Pill>
            <Pill>Firebase</Pill>
            <Pill>Maps</Pill>
            <Pill>Claude Code</Pill>
          </PillRow>
        </CaseStudySection>

        <CaseStudySection id="question" title="The question" tldrVisible>
          <Paragraph>
            The whole product answers one question: where can I get the cheapest pint near me? The
            person asking is usually already out, or deciding where to go, with a phone in one hand.
          </Paragraph>
          <Paragraph>That set two targets before any design started:</Paragraph>
          <List>
            <li>
              <strong>Find the cheapest nearby pint in under 5 seconds.</strong>
            </li>
            <li>
              <strong>Report a price in under 10 seconds.</strong> Pick the pub, enter the price,
              submit. No long forms.
            </li>
          </List>
        </CaseStudySection>

        <CaseStudySection id="principles" title="Principles">
          <List>
            <li>
              <strong>Price first.</strong> The price is the headline everywhere, not the pub name.
            </li>
            <li>
              <strong>Map first.</strong> The map is the home screen, with prices on the markers
              themselves instead of generic pins.
            </li>
            <li>
              <strong>Community verified.</strong> No single report decides what a pint costs.
            </li>
            <li>
              <strong>Recency matters.</strong> Prices lose confidence as they age, and the interface
              says when each was last confirmed.
            </li>
            <li>
              <strong>Browse freely.</strong> Anyone can look; signing in is only needed to report or
              confirm a price.
            </li>
          </List>
          <MediaRow>
            <MediaPlaceholder>Map with price markers: add screenshot</MediaPlaceholder>
            <MediaPlaceholder>Selected pub bottom sheet: add screenshot</MediaPlaceholder>
          </MediaRow>
        </CaseStudySection>

        <CaseStudySection id="price" title="Community price">
          <Paragraph>
            Crowdsourced data only works if one bad report can't wreck it. Each pub&apos;s displayed
            price is a community price, calculated from all of its reports and weighted by how recent
            they are, how many agree, and how far out an unusual one sits.
          </Paragraph>
          <Callout>
            Reports of €6.00, €6.00, €6.00, €6.10, €6.00 and €7.50 still show about €6.00. The one
            outlier doesn&apos;t move the price on its own.
          </Callout>
          <Paragraph>
            The wording matters too. Prices are labelled as community reported and show when they
            were last confirmed, so nothing reads as an official statement from a pub.
          </Paragraph>
          <MediaPlaceholder>Price submission flow: add screenshots</MediaPlaceholder>
        </CaseStudySection>

        <CaseStudySection id="build" title="Building it">
          <Paragraph>
            I planned the product and UX before any code, then built it with Claude Code in sprints:
            foundation, the map, prices, discovery, trust and moderation, and polish. Trust came early. Pubs added by
            users go through review before they appear, and anyone can flag a problem with a pub.
          </Paragraph>
          <Paragraph>Once the core worked, the app grew around nights out, not just prices:</Paragraph>
          <List>
            <li>Votes for the best pint and the best pub in the city</li>
            <li>Live music and &quot;how busy is it?&quot; reports</li>
            <li>Favourites and pub lists, like a 12 Pubs of Christmas route</li>
            <li>Games for the table, including Split the G</li>
          </List>
          <MediaRow>
            <MediaPlaceholder>Voting: add screenshot</MediaPlaceholder>
            <MediaPlaceholder>Split the G: add screenshot</MediaPlaceholder>
          </MediaRow>
        </CaseStudySection>

        <CaseStudySection id="outcomes" title="Outcomes">
          <Callout>
            [Add real numbers: pubs listed, prices reported, people using it, and anything you learned
            from how they used it.]
          </Callout>
          <LiveLink href="https://pints-yurt.web.app/" target="_blank" rel="noopener noreferrer">
            Visit Pints Yurt <FiExternalLink aria-hidden="true" />
          </LiveLink>
        </CaseStudySection>
      </CaseStudyPage>

      <OtherProjects currentProjectId="pints-yurt" />
    </CaseStudyLayout>
  );
}
