import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generate26Questions(): Promise<Question[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Generate exactly 26 distinct IELTS-style reading questions divided into two sections based on the provided text sections.
      
      Passage 1 (Sociology): Focus on the concepts of family as a cornerstone, critical views (Feminism/Marxism), and political debate.
      Passage 2 (Marriage): Focus on the research studies, conflict resolution, and the statistics of divorce vs staying together.

      Requirements:
      1. QUANTITY: Exactly 13 questions for Passage 1 and exactly 13 questions for Passage 2. Total 26 questions.
      2. PASSAGE_ID: Questions for Passage 1 must have passageId: 0. Questions for Passage 2 must have passageId: 1.
      3. TYPES: Use Matching Headings, True/False/Not Given, and Multiple Choice.
      4. OUTPUT: JSON array of objects.

      JSON schema:
      {
        "id": number (unique 1-26),
        "passageId": 0 | 1,
        "type": "matching" | "multiple-choice" | "boolean" | "short-answer",
        "question": string,
        "options": string[] (4 options for choice/matching),
        "correctAnswer": string (exact match)
      }
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            passageId: { type: Type.INTEGER },
            type: { type: Type.STRING },
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.STRING }
          },
          required: ["id", "passageId", "type", "question", "correctAnswer"]
        }
      }
    }
  });

  try {
    const text = response.text || '[]';
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return [];
  }
}
