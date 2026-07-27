import React from "react";
import Splash from "../components/home/Splash";
import styled from "styled-components";


// Content container above LaserFlow
const ContentWrapper = styled.div`
  position: relative;
  z-index: 0; /* above LaserFlow */
`;

export default function Home() {
  return (
    <>
      <title>Dara Phillips → Portfolio</title>
      <meta
        name="description"
        content="Dara Phillips is a Product Designer specialising in immersive, interactive experiences using creative technology."
      />
      <meta name="keywords" content="React, Digital Media, Product Design, Design Systems, Portfolio, Dara Phillips" />
      <meta property="og:title" content="Dara Phillips Portfolio" />
      <meta property="og:description" content="Product Designer" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://daraphillips.com" />
      <meta property="og:image" content="https://daraphillips.com/preview.jpg" />

      <ContentWrapper>
        <Splash />
      </ContentWrapper>
    </>
  );
}
