// types/news.ts

// news article tied to a player
export interface PlayerArticle {
  playerName: string;   // e.g. "Patrick Mahomes"
  teamName: string;     // e.g. "Kansas City Chiefs"
  articleImage: string; // url to article image (or placeholder)
  date: string;         // ISO string or YYYY-MM-DD
  headline: string;     // article headline
  source: string;       // e.g. "NFL.com"
  sourceLink: string;   // link to original article
  content: string;      // article body/content
}

// player type for roster/injury/etc.
export type InjuryStatus = "Available" | "Questionable" | "Out" | "Probable";

export interface Player {
  name: string;
  team: string;
  position: "QB" | "RB" | "WR" | "TE" | "DEF" | "K"; // expandable
  status: InjuryStatus;
}
