import './globals.css';

export const metadata = {
  title: 'ReggaeAI — Caribbean AI Music',
  description: 'Discover, create, license and publish Caribbean AI music, riddims and videos.',
  metadataBase: new URL('https://reggaeai.example'),
  openGraph: {
    title: 'ReggaeAI',
    description: 'Caribbean-first AI music discovery, creation and licensing.',
    type: 'website'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
