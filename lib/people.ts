import { checkBotId } from 'botid/server';

/* People only (GD, 2026-10-22: "ensure humans"). A vote or a draw entry counts
   only from a person. Two checks, the same pair k-kut runs as SNPR and HUNTR:
   a request that says it is a robot, or names no browser, is refused on sight;
   then Vercel BotID, an invisible check in the page, has to agree it is a person. */
const ROBOT = /bot|crawl|spider|slurp|preview|fetch|curl|wget|python|httpclient|headless|monitor|scan/i;

export async function isPerson(request: Request): Promise<boolean> {
  const ua = request.headers.get('user-agent') ?? '';
  if (!ua || ROBOT.test(ua) || !/Mozilla\//.test(ua)) return false;
  try {
    const verdict = await checkBotId();
    return !verdict.isBot;
  } catch {
    /* The check itself failing must not lock real people out; the first test still held. */
    return true;
  }
}
