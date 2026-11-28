/* The title a listener sees. Display only: the stored title is never changed.
   GD, 2026-11-28: song names showed as raw file titles, e.g. "CHRISTMAS STAR - Indie"
   and "FEARLESS - Rec'd 1988 - East Houston". Show the clean title only, without the
   genre or recording notes. In the catalogue, those notes always follow the first
   " - " (space, dash, space), so the clean title is everything before it. */
export function displayTitle(title: string): string {
  const clean = title.split(' - ')[0].replace(/\s{2,}/g, ' ').trim();
  return clean || title.trim();
}

/** The same track with its title cleaned for display; id, artist and stream are untouched. */
export function withDisplayTitle<T extends { title: string }>(track: T): T {
  return { ...track, title: displayTitle(track.title) };
}
