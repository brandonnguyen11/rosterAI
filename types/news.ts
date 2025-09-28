// types/news.ts

// news article tied to a player
export interface PlayerArticle {
  playerName: string;
  teamName: string;
  date: string;
  articleTitle: string;
  sourceHost: string;
  sourceURL: string;
  bodyText: string;
}


// player type for roster/injury/etc.
export type InjuryStatus = "Available" | "Questionable" | "Out" | "Probable";

export interface Player {
  name: string;
  team: string;
  position: "QB" | "RB" | "WR" | "TE" | "DEF" | "K"; // expandable
  status: InjuryStatus;
}
