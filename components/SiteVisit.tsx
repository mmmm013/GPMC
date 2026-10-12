'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/*
 * One page_view per page, sent to the GPMx visit counter on k-kut.com so one
 * report reads every domain. GD, 2026-10-12: "all 3, go".
 * Path and referrer only -- no IP, no person. sendBeacon posts text/plain, so
 * there is no preflight, and it never throws: a count that breaks a page is
 * worse than none.
 */
const KEY = 'gpm_visit_sid';

function sessionId(): string {
  try {
    let sid = window.sessionStorage.getItem(KEY) || '';
    if (!sid) {
      sid = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      window.sessionStorage.setItem(KEY, sid);
    }
    return sid;
  } catch {
    return '';
  }
}

export default function SiteVisit() {
  const pathname = usePathname();
  const last = useRef('');

  useEffect(() => {
    const path = pathname || '/';
    if (path === last.current) return;
    last.current = path;
    try {
      const body = JSON.stringify({ path, referrer: document.referrer || '', session_id: sessionId() });
      navigator.sendBeacon?.('https://www.k-kut.com/api/visit', body);
    } catch {
      /* never in the way of the page */
    }
  }, [pathname]);

  return null;
}
