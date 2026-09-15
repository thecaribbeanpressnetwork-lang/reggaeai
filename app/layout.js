import './globals.css';
import './catalogue.css';
import './shell.css';
import './home.css';
import SiteHeader from './components/SiteHeader';
import PersistentPlayer from './components/PersistentPlayer';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reggaeai-live-production.up.railway.app';

export const metadata = {
  title: {
    default: 'ReggaeAI — Caribbean AI Music',
    template: '%s | ReggaeAI'
  },
  description: 'Discover, create, license and publish Caribbean AI music, riddims and videos.',
  metadataBase: new URL(baseUrl),
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

export const viewport = {
  themeColor: '#090806',
  colorScheme: 'dark'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <PersistentPlayer />
      </body>
    </html>
  );
}
