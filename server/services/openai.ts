import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "default_key");

export interface AppGenerationRequest {
  appName: string;
  prompt: string;
  backend: string;
  iconUrl?: string;
}

export interface GeneratedApp {
  files: {
    [filePath: string]: string;
  };
  structure: string[];
  readme: string;
}

export async function generateFlutterApp(request: AppGenerationRequest): Promise<GeneratedApp> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `You are an expert Flutter developer. Generate a complete Flutter app based on the user's requirements.

Create a production-ready Flutter app with:
1. Proper project structure
2. Material 3 design
3. Clean, maintainable code
4. Proper state management
5. Navigation between screens
6. ${request.backend} backend integration
7. Authentication if needed
8. Responsive design

App Specifications:
- App Name: ${request.appName}
- Backend: ${request.backend}
- ${request.iconUrl ? `Icon URL: ${request.iconUrl}` : 'Generate appropriate icons'}
- Description: ${request.prompt}

Return ONLY a valid JSON response with:
- files: object with file paths as keys and file contents as values
- structure: array of file paths showing the project structure
- readme: markdown documentation for the app

Focus on creating a realistic, functional app that matches the description exactly.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }
    
    const parsedResult = JSON.parse(jsonMatch[0]);
    return parsedResult as GeneratedApp;
  } catch (error) {
    throw new Error(`Failed to generate Flutter app: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateAppIcon(appName: string, description: string): Promise<string> {
  // Note: Gemini doesn't have image generation capabilities, so we'll return a placeholder or use an alternative service
  // For now, we'll return an empty string to indicate no icon was generated
  console.log(`Icon generation requested for ${appName}: ${description}`);
  return '';
}

export async function enhancePrompt(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const enhancePrompt = `You are an expert app designer. Enhance the user's app description to include specific technical details, UI/UX requirements, and feature specifications that will help generate a better Flutter app.

Add details about:
- Specific screens and navigation flow
- UI components and layouts
- Color schemes and design style
- Data models and functionality
- User interactions and workflows

Original prompt: ${prompt}

Return only the enhanced description without any additional text or explanations.`;

  try {
    const result = await model.generateContent(enhancePrompt);
    const response = await result.response;
    const text = response.text();
    
    return text.trim() || prompt;
  } catch (error) {
    console.error("Failed to enhance prompt:", error);
    return prompt;
  }
}
