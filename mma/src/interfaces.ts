export interface Prediction {
  winner: string;
  method?: string;
}

export interface BestOddsBook {
  platform: string;
  odds: number;
}

export interface BestOdds {
  groundTruthProb: number;
  bestOdds: BestOddsBook;
  bestEv: number;
}

export interface FightEntry {
  prediction?: Prediction;
  result?: { winner: string };
  bestOdds?: BestOdds | null;
}

export interface Card {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  location?: string;
  eventTime?: string;
  poster: string;
  rating?: number;
  recapUrl?: string;
  previewUrl?: string;
  fights?: Record<string, FightEntry>;
}

export interface CardsData {
  cards: Card[];
}
