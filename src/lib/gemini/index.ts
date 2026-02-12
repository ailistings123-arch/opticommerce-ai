import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// TRAINING DATA: These examples "train" the model on your SaaS style
const trainingHistory = [
  {
    role: "user",
    parts: [{ text: "Optimize: 'Blue Mug' for Amazon" }],
  },
  {
    role: "model",
    parts: [
      {
        text: JSON.stringify({
          title: "12oz Cobalt Blue Ceramic Coffee Mug - Microwave Safe, Glossy Finish",
          description: "Start your day with a splash of color...",
          seo_score: 98,
        }),
      },
    ],
  },
];

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are the OptiCommerce SEO expert. Always return JSON.",
});

export async function generateOptimizedContent(title: string, platform: string) {
  const result = await geminiModel.generateContent({
    contents: [
      ...trainingHistory,
      { role: "user", parts: [{ text: `Optimize: ${title} for ${platform}` }] },
    ],
  });
  return JSON.parse(result.response.text());
}
