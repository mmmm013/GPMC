// sites/k-kut/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "G Putnam Music",
  description: "G Putnam Music: songs to hear, and HUGs to send.",
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

        {/* === GLOBAL TELEMETRY: PAGE VIEW === */}
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
        source: 'k-kut',
        url: window.location.pathname,
        ts: Date.now()
      })
    }).catch(function(){});
  } catch(e){}
})();
`,
          }}
        />

        {/* === GLOBAL TELEMETRY: CLICK + CHECKOUT TRACKING === */}
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
          source: 'k-kut',
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

        // BUY / DONATE BUTTON DETECTION
        if (
          text.includes('buy') ||
          text.includes('donate') ||
          text.includes('support') ||
          href.includes('checkout') ||
          href.includes('stripe')
        ) {
          sendEvent('checkout_click');
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