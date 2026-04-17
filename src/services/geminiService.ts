/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const AEO_SYSTEM_INSTRUCTION = `
OPTIMIZE FOR AI CITATION (AEO/GEO):
- Prioritize short, concise answers (direct and punchy).
- Use clear and distinct subheadings (H2, H3) that look like category labels.
- Make FAQ sections easily quotable by language models (Question? Answer start directly).
- Provide a straightforward summary at the beginning or end.
- Use bullet points for readability.
- Avoid fluff and flowery language.
`;

export async function generateContentStructure(topic: string, type: string, keywords: string[], aeo: boolean = false, extra?: string) {
  const prompt = `Generate a detailed content structure for a/an "${type}" on the topic: "${topic}". 
Keywords to include: ${keywords.join(', ')}.
Extra instructions: ${extra || 'None'}
${aeo ? 'OPTIMIZE FOR AEO: Use distinct, punchy subheadings and clear logical flow.' : ''}
Return the structure as a markdown document with H2 and H3 headers.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: aeo ? AEO_SYSTEM_INSTRUCTION : undefined
    }
  });

  return response.text;
}

export async function generateSEOMeta(topic: string, type: string, keywords: string[], aeo: boolean = false) {
  const prompt = `Generate Title, Description, H1, and Slug for a/an "${type}" on the topic: "${topic}".
Keywords to include: ${keywords.join(', ')}.
Title: 50-70 characters.
Description: 150-160 characters.
${aeo ? 'For AEO: Ensure Title and H1 are extremely clear and reflect the search intent directly.' : ''}
Format as JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: aeo ? AEO_SYSTEM_INSTRUCTION : undefined,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          h1: { type: Type.STRING },
          slug: { type: Type.STRING },
        },
        required: ["title", "description", "h1", "slug"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error('Failed to parse meta JSON:', e);
    return null;
  }
}

export async function generateFAQ(topic: string, count: number = 5, aeo: boolean = false) {
  const prompt = `Generate ${count} FAQ questions and answers for the topic: "${topic}". 
${aeo ? 'For AEO: Answers must be direct, starting with the main info. No pleasantries.' : ''}
Format as JSON array of { question, answer }.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: aeo ? AEO_SYSTEM_INSTRUCTION : undefined,
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
          },
          required: ["question", "answer"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error('Failed to parse FAQ JSON:', e);
    return [];
  }
}

export async function generateImagePrompt(topic: string, style: string = 'photorealistic') {
  const prompt = `Generate a master image prompt for a horizontal header image (16:9) on the topic: "${topic}". 
Style: ${style}. 
No text on image, no people unless specific, vivid details.
Output ONLY the prompt text.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
}

export async function generateFullDraft(topic: string, structure: string, tone: string = 'professional', aeo: boolean = false) {
  const prompt = `Generate a full article based on this structure:
${structure}

Topic: "${topic}"
Tone: ${tone}
${aeo ? 'CRITICAL: Optimize for AI citation. Short answers, direct subheadings, concise prose.' : ''}
Format: Markdown.`;

  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: aeo ? AEO_SYSTEM_INSTRUCTION : undefined
    }
  });

  return response; // Return the stream for real-time output
}

export async function humanizeText(text: string, level: string = 'high') {
  const prompt = `Rewrite this text to be more human, natural, and less like AI output. 
Maintain the structure and format. 
Humanization level: ${level}.
Text to humanize:
${text}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
}
