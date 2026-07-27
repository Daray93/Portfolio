import styled from "styled-components";

export default function PasswordCard({ title, category, onClick }) {
  return (
    <Card onClick={onClick}>
      <LockBadge>
        <LockIcon aria-hidden="true">
          <svg width="0.8rem" height="0.8rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </LockIcon>
        Password protected
      </LockBadge>

      {(title || category) && (
        <Overlay>
          <LeftStack>
            {title && <Title>{title}</Title>}
            {category && <Category>{category}</Category>}
          </LeftStack>
        </Overlay>
      )}

      <HoverReveal>
        <HoverLockIcon aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </HoverLockIcon>
        <HoverLabel>Enter password to view</HoverLabel>
      </HoverReveal>
    </Card>
  );
}

/* ---------------- styles ---------------- */

const Card = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 24px;
  background: ${({ theme }) => theme.cardBg};
  cursor: none;
`;

const LockBadge = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textSecondary};
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.85rem;
  border-radius: 20px;
  padding: 4px 10px 4px 7px;
  font-family: "Space Grotesk", sans-serif;
  font-weight: 400;
  transition: opacity 0.25s ease;

  ${Card}:hover & {
    opacity: 0;
  }
`;

const LockIcon = styled.span`
  display: flex;
  align-items: center;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
  transition: opacity 0.25s ease;

  ${Card}:hover & {
    opacity: 1;
  }
`;

const LeftStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Title = styled.span`
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  font-weight: 500;
  font-family: "Space Grotesk", sans-serif;
  letter-spacing: 0.01em;
`;

const Category = styled.span`
  width: fit-content;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  backdrop-filter: blur(24px);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;

  background: ${({ $bg }) => $bg || "#bebebe2b"};
  color: ${({ $color }) => $color || "#000"};
  border: 1px solid ${({ $color }) => ($color ? `${$color}55` : "#00000022")};
`;

const HoverReveal = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  opacity: 0;
  transition: opacity 0.25s ease;

  ${Card}:hover & {
    opacity: 1;
  }
`;

const HoverLockIcon = styled.span`
  color: ${({ $color }) => $color || "#000"};
  display: flex;
`;

const HoverLabel = styled.span`
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.82rem;
  font-weight: 400;
  color: ${({ $color }) => $color || "#000"};
  letter-spacing: 0.04em;
`;
