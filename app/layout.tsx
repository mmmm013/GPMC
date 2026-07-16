import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gputnammusic.com"),
  title: {
    default: "G Putnam Music | Original Song Catalog",
    template: "%s | G Putnam Music",
  },
  description:
    "Listen to original G Putnam Music songs and browse approved IN/O-PIX and LT-PIX catalog lanes. Retail pricing and checkout remain held pending final catalog locks.",
  applicationName: "G Putnam Music",
  openGraph: {
    type: "website",
    url: "https://www.gputnammusic.com",
    siteName: "G Putnam Music",
    title: "G Putnam Music | Original Song Catalog",
    description:
      "Original G Putnam Music songs, approved catalog lanes, listening, licensing, and controlled retail preparation.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}

        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    fetch('/api/public/audio-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'page_view',
        source: 'gputnam-music',
        url: window.location.pathname,
        ts: Date.now()
      })
    }).catch(function(){});
  } catch(e){}
})();
`,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    function sendEvent(type){
      fetch('/api/public/audio-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: type,
          source: 'gputnam-music',
          url: window.location.pathname,
          ts: Date.now()
        })
      }).catch(function(){});
    }

    document.addEventListener('click', function(e){
      try {
        var el = e.target;
        if (!el) return;

        var text = (el.innerText || '').toLowerCase();
        var href = (el.href || '').toLowerCase();

        if (
          text.includes('shop songs') ||
          text.includes('browse songs') ||
          text.includes('licensing') ||
          href.includes('/songs') ||
          href.includes('/commercial') ||
          href.includes('k-kut.com')
        ) {
          sendEvent('catalog_interest_click');
        }
      } catch(err){}
    }, true);
  } catch(e){}
})();
`,
          }}
        />
      </body>
    </html>
  );
}
