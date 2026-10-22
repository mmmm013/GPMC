'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

/* Everyone at once: during a riff run, the screen glows brighter as more people
   listen at the same moment, anywhere in the world. Each listener counts only
   as a random tag for this visit; no name, no address, nothing kept. */
export default function Together({ week }: { week: string }) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    const client = createClient(url, key);
    const me = Math.random().toString(36).slice(2);
    const channel = client.channel(`riff-run:${week}`, { config: { presence: { key: me } } });
    channel
      .on('presence', { event: 'sync' }, () => setCount(Math.max(1, Object.keys(channel.presenceState()).length)))
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') void channel.track({ at: Date.now() });
      });
    return () => {
      void client.removeChannel(channel);
    };
  }, [week]);

  /* The glow grows with the crowd, quickly at first and then gently. */
  const glow = Math.min(1, Math.log10(count + 1) / 3);
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl transition-all duration-1000"
      style={{ boxShadow: `0 0 ${20 + glow * 120}px ${glow * 40}px rgba(255,213,79,${0.15 + glow * 0.5})` }}>
      <p className="absolute -bottom-7 right-2 text-xs font-bold text-[#FFD54F]">
        {count === 1 ? 'You are listening' : `${count.toLocaleString()} listening right now, worldwide`}
      </p>
    </div>
  );
}
