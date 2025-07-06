const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    height: 100%;
  }
  body {
    font-family: Inter, Tahoma, Geneva, Verdana, sans-serif;
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    transition: background 0.3s ease, color 0.3s ease;
  }
    h1 {
  font-weight: 500;
}
h2 {
  font-weight: 400;
}
h3 {
  font-weight: 200;
}

  * {
    box-sizing: border-box;
  }

`;

