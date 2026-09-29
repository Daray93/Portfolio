import Showcase from "../components/showcase/Showcase";
import websites from "../data/websites";

// Live sites built for clients, as the same carousel as the case studies --
// inside the shared frame (see Shell), so switching between Work and
// Websites is the cards sliding across while the background re-tints. The
// list itself lives in src/data/websites.js.

export default function Websites() {
  return (
    <>
      <title>Websites → Dara Phillips</title>
      <meta name="description" content="Live websites designed and built by Dara Phillips." />
      <Showcase items={websites} kind="sites" label="Websites" />
    </>
  );
}
