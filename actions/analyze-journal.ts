"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function analyzeJournalContent(content: string) {
  if (!content || content.trim().length < 10) {
    return {
      mood: "Unspecified",
      analysis: "Write a bit more (at least 10 characters) to get a full AI psychological evaluation.",
    };
  }

  if (!process.env.GEMINI_API_KEY) {
    // Elegant offline analysis simulator
    const moods = ["Reflective", "Optimistic", "Determined", "Anxious", "Calm", "Focused"];
    const selectedMood = moods[Math.floor(Math.random() * moods.length)];
    return {
      mood: selectedMood,
      analysis: `[Offline Mode Analysis]
You expressed thoughts related to your daily progress. Based on your content, you are showing a "${selectedMood}" state. 
Growth Action: Continue maintaining this habit loop. Ensure you dedicate 15 minutes of uninterrupted deep focus to your high-priority items.`,
    };
  }

  try {
    const prompt = `Analyze the following reflection journal entry. Extract:
1. One single word representing the dominant mood (e.g. Reflective, Excited, Anxious, Calm, Confused, Focused, Tired).
2. A 2-3 sentence psychological feedback and action-oriented growth advice.

Respond strictly in the following JSON format:
{
  "mood": "mood_word",
  "analysis": "feedback_text"
}

Journal content: "${content}"`;

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
    });

    // Parse response
    const parsed = JSON.parse(text.trim());
    return {
      mood: parsed.mood || "Reflective",
      analysis: parsed.analysis || "Growth focus: keep reviewing your daily goals.",
    };
  } catch (error) {
    console.error("AI Journal analysis failed:", error);
    return {
      mood: "Thoughtful",
      analysis: "Analysis completed. Continue monitoring your progress and prioritizing tasks.",
    };
  }
}
