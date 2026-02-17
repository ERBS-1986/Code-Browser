
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedApp } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateAppSimulation(prompt: string, fileContext?: string): Promise<GeneratedApp> {
  const systemPrompt = fileContext 
    ? `You are a professional web developer. I will provide you with the source code of a local project. 
       Your task is to analyze these files and simulate the UI in a simplified, interactive React-like format.
       
       PROJECT FILES:
       ${fileContext}
       
       Identify the entry point (index.html, index.tsx, etc.) and recreate its visual structure.
       Break it down into interactive elements. For each element, provide a realistic code snippet (from the files provided or a logic-consistent equivalent) and an explanation.`
    : `Simulate a web application based on this prompt: "${prompt}". 
       Create a functional React-like UI description. 
       Break it down into interactive elements. 
       For each element, provide a realistic code snippet (React/TSX) and a detailed explanation of what that specific code does.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt || "Analyze the provided project files and simulate the app.",
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          fullCode: { type: Type.STRING, description: "The complete React component code for the app" },
          elements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                codeSnippet: { type: Type.STRING },
                explanation: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['button', 'input', 'card', 'layout', 'logic'] }
              },
              required: ["id", "name", "codeSnippet", "explanation", "type"]
            }
          }
        },
        required: ["title", "fullCode", "elements"]
      }
    }
  });

  const result = JSON.parse(response.text);
  return result;
}
