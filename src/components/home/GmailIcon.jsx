// Gmail's actual four-color envelope mark. The chevron ("flap") carries
// its own class so a hover parent can animate it independently -- see the
// `.gmail-flap` rule wired up in Splash.jsx's EmailIcon.
export default function GmailIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#34A853" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
      <path fill="#4285F4" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
      <path
        className="gmail-flap"
        fill="#EA4335"
        d="M35,11.2v0.01L24,19.45L13,11.2v-0.01l-1,5.8l1,6.7l11,8.25l11-8.25l1-6.7L35,11.2z"
      />
      <path
        fill="#C5221F"
        d="M3,12.298V16.2l10,7.5v-12.5l-3.124-2.341C9.132,8.319,8.235,8,7.313,8H7.287 C4.924,8,3,9.924,3,12.287z"
      />
      <path
        fill="#FBBC05"
        d="M45,12.298V16.2l-10,7.5v-12.5l3.124-2.341C38.868,8.319,39.765,8,40.687,8h0.026 C43.076,8,45,9.924,45,12.287z"
      />
    </svg>
  );
}
