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
  console.log(`Creating fallback icon for ${appName}`);
  
  // Create a fallback icon immediately without using AI to avoid quota issues
  const firstLetter = appName.charAt(0).toUpperCase();
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${randomColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${randomColor}AA;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" fill="url(#grad)" rx="16"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white">${firstLetter}</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svgIcon).toString('base64')}`;
}

export async function enhancePrompt(prompt: string): Promise<string> {
  // Skip AI enhancement to avoid quota issues, return original prompt
  console.log("Skipping prompt enhancement to conserve API quota");
  return prompt;
}
