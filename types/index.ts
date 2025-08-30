export interface TwitterAnalysisResult {
  coordinates: {
    desperate: number;
    performative: number;
    cry_for_help: number;
    ragebaiter: number;
  };
  confidence: number;
  reasoning: string;
  key_indicators: string[];
}

export interface TwitterAnalysisRequest {
  username: string;
}

export interface TwitterAnalysisError {
  error: string;
}
