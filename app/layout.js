import './globals.css';

export const metadata = {
  title: {
    default: 'ReggaeAI — Caribbean AI Music',
    template: '%s | ReggaeAI'
  },
  description: 'Discover, create, license and publish Caribbean AI music, riddims and videos.',
  metadataBase: new URL('https://reggaeai-production-production.up.railway.app'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'ReggaeAI',
    description: 'Caribbean-first AI music discovery, creation and licensing.',
    type: 'website',
    siteName: 'ReggaeAI'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReggaeAI — Caribbean AI Music',
    description: 'Caribbean-first AI music discovery, creation and licensing.'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
