
export enum FortuneLevel {
  DaiKichi = "Great Blessing (大吉)",
  Kichi = "Blessing (吉)",
  ChuKichi = "Middle Blessing (中吉)",
  ShoKichi = "Small Blessing (小吉)",
  SueKichi = "Future Blessing (末吉)"
}

export interface FortuneAdvice {
  luck: string;
  happiness: string;
  stress: string;
  health: string;
}

export interface FortuneSlip {
  id: string;
  month: string; // Format: YYYY-MM
  level: FortuneLevel;
  poem: string; // Was 'title'/'text' - now a single poetic quote
  focusOn: string; // Was 'luckyItem'
  doingWell: string; // Was 'luckyColor'
  advice: FortuneAdvice; // Detailed structured advice
  imageUrl?: string;
}

export interface UserHistory {
  email: string;
  draws: {
    [month: string]: string; // month -> fortuneSlipId
  };
}

export interface AppConfig {
  userPasscode: string;
  customLogo?: string; // Base64 string of the custom logo
}

export type ViewState = 'LANDING' | 'GATE' | 'SHRINE' | 'REVEAL' | 'ADMIN';
