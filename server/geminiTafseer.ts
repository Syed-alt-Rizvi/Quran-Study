import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { cleanTafseerUrduText } from "../src/services/cleanTafseerText";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

// Directory for permanently caching AI-refined Ayahs
const REFINED_DIR = path.join(process.cwd(), "public", "tafseer_kauthar_refined");
if (!fs.existsSync(REFINED_DIR)) {
  try {
    fs.mkdirSync(REFINED_DIR, { recursive: true });
  } catch (e) {
    console.error("Could not create refined dir:", e);
  }
}

export async function getOrRefineTafseer(
  surah: number,
  ayah: number,
  rawUrduText: string,
  forceRefresh = false
): Promise<{ text: string; isAiRefined: boolean; quotaExceeded?: boolean }> {
  const cacheFile = path.join(REFINED_DIR, `s${surah}_a${ayah}.json`);

  // Check if already refined
  if (!forceRefresh && fs.existsSync(cacheFile)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
      if (cached && cached.text && cached.text.trim().length > 0) {
        return { text: cached.text, isAiRefined: true };
      }
    } catch (e) {
      // Continue to refine
    }
  }

  // Clean raw text first to eliminate obvious OCR corruptions and broken spaces
  const preCleanedText = cleanTafseerUrduText(rawUrduText || "");

  // If text is empty or very short, return cleaned
  if (!preCleanedText || preCleanedText.trim().length < 20) {
    return { text: preCleanedText || "", isAiRefined: false };
  }

  const ai = getGeminiClient();
  if (!ai) {
    return { text: preCleanedText, isAiRefined: false };
  }

  const systemPrompt = `You are a world-class Islamic scholar and master Urdu proofreader specializing in "Tafseer Al-Kauthar" (تفسیر الکوثر) by Allama Sheikh Mohsin Ali Najafi (علامہ شیخ محسن علی نجفی).

Goal:
The input contains raw Urdu/Arabic Tafseer text with severe OCR corruptions, broken word fragments (e.g. "ک ر ن ا", "ت ھ ا", "م ی ں"), phonetic spelling mistakes, incorrect letter joins, and grammatical errors.

Instructions:
1. Fix all grammatical, vocabulary, spelling, and OCR approximation errors into pristine, authentic, academic Urdu (نستعلیق معیاری اردو).
2. Correctly format and restore all Arabic Quranic Ayahs, Hadith citations, and references (e.g. نہج البلاغہ, بحار الانوار).
3. Preserve the exact theological commentary, explanation, arguments, and authorial voice of Allama Sheikh Mohsin Ali Najafi. Do not alter his scholarly stances.
4. Retain standard Markdown headers and list formatting.
5. Return ONLY the corrected Urdu commentary text without conversational filler, preambles, or English explanations.`;

  const userPrompt = `Please proofread, correct vocabulary, repair broken ligatures/words, and fix all grammatical errors for Surah ${surah}, Ayah ${ayah} of Tafseer Al-Kauthar:

---
${preCleanedText.slice(0, 15000)}
---`;

  const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-3.8-flash"];

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        },
      });

      const refinedText = response.text?.trim();
      if (refinedText && refinedText.length > 30) {
        // Cache to disk
        try {
          fs.writeFileSync(
            cacheFile,
            JSON.stringify({
              surah,
              ayah,
              text: refinedText,
              refinedAt: new Date().toISOString(),
              model: modelName
            }, null, 2),
            "utf8"
          );
        } catch (err) {
          console.error("Error saving refined cache:", err);
        }
        return { text: refinedText, isAiRefined: true };
      }
    } catch (error: any) {
      const isQuota = error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") || error?.message?.includes("Quota exceeded");
      if (isQuota) {
        console.warn(`Gemini quota limit reached on ${modelName} for Surah ${surah} Ayah ${ayah}. Attempting fallback or graceful return.`);
      } else {
        console.warn(`Gemini approximation note for Surah ${surah} Ayah ${ayah} on ${modelName}:`, error?.message || error);
      }
    }
  }

  // Graceful fallback to pre-cleaned text
  return { text: preCleanedText, isAiRefined: false, quotaExceeded: true };
}
