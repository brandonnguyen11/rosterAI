// types/news.ts

// news article tied to a player
export interface PlayerArticle {
  playerName: string;
  teamName: string;
  articleImage: string;
  playerImage: string;       // ✅ new field
  availability: "available" | "questionable" | "out"; // ✅ new field
  date: string;
  headline: string;
  source: string;
  sourceLink: string;
  content: string;
  sourceHost: string; // <-- add this
}


// player type for roster/injury/etc.
export type InjuryStatus = "Available" | "Questionable" | "Out" | "Probable";

export interface Player {
  name: string;
  team: string;
  position: "QB" | "RB" | "WR" | "TE" | "DEF" | "K"; // expandable
  status: InjuryStatus;
}
