'use client';

import dynamic from 'next/dynamic';

/* The games keep progress in this browser, so they render in the browser only. */
export const CanIGame = dynamic(() => import('./CanIGame'), { ssr: false });
export const BugStoryGame = dynamic(() => import('./BugStoryGame'), { ssr: false });
export const SixteenBall = dynamic(() => import('./SixteenBall'), { ssr: false });
export const Wonders = dynamic(() => import('./wonders/Wonders'), { ssr: false });
export const LoveGame = dynamic(() => import('./love/LoveGame'), { ssr: false });
export const CoupleGame = dynamic(() => import('./love/CoupleGame'), { ssr: false });
