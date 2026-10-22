import { initBotId } from 'botid/client/core';

/* People only (GD, 2026-10-22: "ensure humans"). These requests carry Vercel
   BotID's invisible check, and the server refuses any that a robot sent. */
initBotId({
  protect: [
    { path: '/api/riff-runs/vote', method: 'POST' },
    { path: '/api/game-answer', method: 'POST' },
  ],
});
