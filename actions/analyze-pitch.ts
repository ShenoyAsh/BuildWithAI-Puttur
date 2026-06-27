"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";

interface PitchCritique {
  score: number;
  structure: string;
  vocabulary: { simple: string; polished: string[] }[];
  pacing: string;
}

export async function analyzePitchContent(draft: string, wpm: number): Promise<PitchCritique> {
  const words = draft.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const seconds = Math.round((words / wpm) * 60);

  // Fallback simulator if no API Key is set
  if (!process.env.GEMINI_API_KEY) {
    const mockReplacements = [
      { simple: "use", polished: ["leveraged", "implemented", "harnessed", "utilized"] },
      { simple: "make", polished: ["orchestrated", "engineered", "constructed", "pioneered"] },
      { simple: "build", polished: ["developed", "architected", "formulated", "established"] },
      { simple: "improve", polished: ["optimized", "enhanced", "refined", "accelerated"] },
      { simple: "run", polished: ["executed", "spearheaded", "administered", "directed"] },
    ];

    const foundVocab: { simple: string; polished: string[] }[] = [];
    mockReplacements.forEach((item) => {
      const regex = new RegExp(`\\b${item.simple}\\b`, "i");
      if (regex.test(draft)) {
        foundVocab.push(item);
      }
    });

    let score = 75;
    if (words >= 40 && words <= 100) score += 10;
    else score -= 10;
    score -= foundVocab.length * 3;
    score = Math.max(40, Math.min(95, score));

    let pacingAdvice = "Excellent pitch length. Your speech fits perfectly within a 30-45 second window.";
    if (seconds > 60) pacingAdvice = "Your pitch exceeds 60 seconds. Try to condense your value proposition to avoid losing your audience's attention.";
    if (seconds < 15) pacingAdvice = "Too brief. Introduce yourself, state the problem you solve, and provide a clear call to action.";

    return new Promise((resolve) =>
      setTimeout(() => {
        resolve({
          score,
          structure: words > 30 
            ? "[Demo Mode] Hook established. Clear value proposition stated. Consider adding a stronger call to action at the end." 
            : "[Demo Mode] Structure is too short. Try following the 'Problem-Solution Hook' template.",
          vocabulary: foundVocab,
          pacing: pacingAdvice,
        });
      }, 1000)
    );
  }

  try {
    const prompt = `Analyze the following elevator pitch for a software engineering or professional placement context.
Draft content: "${draft}"
Target WPM (Words Per Minute): ${wpm}
Calculated speech duration: ${seconds} seconds (based on ${words} words)

Evaluate the pitch across four dimensions:
1. Impact score (an integer from 30 to 100).
2. Structure feedback: Is there a hook? Is the problem and solution clear? Is there a call to action? Keep this to 2 sentences.
3. Vocabulary replacements: Identify simple, weak, or repetitive verbs/words in the draft and provide 3-4 professional, action-oriented, polished alternatives for each.
4. Pacing advice: Critique the length and speed. Is it too fast, too slow, too long (should be 30-60 seconds)? Keep this to 2 sentences.

Respond strictly in the following JSON format, and do not wrap in markdown code blocks:
{
  "score": 85,
  "structure": "Structure feedback text",
  "vocabulary": [
    { "simple": "simple_word_found_in_text", "polished": ["alternative1", "alternative2", "alternative3"] }
  ],
  "pacing": "Pacing advice text"
}
`;

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
    });

    // Strip markdown formatting if any is returned
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.substring(7);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    const parsed = JSON.parse(cleanText);

    return {
      score: typeof parsed.score === "number" ? parsed.score : 75,
      structure: parsed.structure || "Good structure.",
      vocabulary: Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [],
      pacing: parsed.pacing || "Good pacing.",
    };
  } catch (error) {
    console.error("AI Pitch analysis failed:", error);
    return {
      score: 70,
      structure: "Failed to parse critique from AI. Try adjusting the pitch wording.",
      vocabulary: [],
      pacing: "Pacing is normal.",
    };
  }
}
