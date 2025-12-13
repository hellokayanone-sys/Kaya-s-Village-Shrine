import { GoogleGenAI } from "@google/genai";

// AI features have been replaced by manual admin entry and uploads.
// This file is kept to maintain import consistency if needed, but contains no active logic.

export const generateFortuneIllustration = async (): Promise<string | undefined> => {
  console.warn("AI generation is disabled. Please upload images manually in the Admin Panel.");
  return undefined;
}