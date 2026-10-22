/* One game moment, counted beside the site's page views on k-kut.com (GD,
   2026-10-22: "monitor. & report on all games"). Which game and how it went,
   never who played. It never throws: a count that breaks a game is worse than none. */
export type GameMoment = 'game_start' | 'game_finish' | 'prize_link' | 'prize_sent';

export function gameEvent(event: GameMoment, detail: { game: string; ribbon?: string; round?: string; how?: string }) {
  try {
    const body = JSON.stringify({
      event,
      detail,
      path: window.location.pathname,
      referrer: document.referrer || '',
      session_id: window.sessionStorage.getItem('gpm_visit_sid') || '',
    });
    navigator.sendBeacon?.('https://www.k-kut.com/api/visit', body);
  } catch {
    /* never in the way of the game */
  }
}
