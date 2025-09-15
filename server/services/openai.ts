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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  try {
    // Generate detailed icon description using Gemini
    const iconPrompt = `Create a detailed description for a modern mobile app icon for "${appName}".

App Description: ${description}

Generate a detailed visual description that includes:
- Color scheme (2-3 main colors)
- Main visual elements/symbols
- Shape and style (modern, flat design, etc.)
- Typography style for any text elements
- Overall aesthetic (professional, playful, minimalist, etc.)

Format the response as a JSON with the following structure:
{
  "description": "Complete visual description",
  "colors": ["primary color", "secondary color"],
  "elements": ["main element", "secondary element"],
  "style": "design style",
  "iconUrl": "data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#4F46E5" rx="12"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="white">${appName.charAt(0).toUpperCase()}</text></svg>')}"
}

Return only the JSON response.`;

    const result = await model.generateContent(iconPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Fallback: create a simple text-based icon
      const firstLetter = appName.charAt(0).toUpperCase();
      const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <rect width="64" height="64" fill="#4F46E5" rx="12"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="white">${firstLetter}</text>
      </svg>`;
      return `data:image/svg+xml;base64,${Buffer.from(svgIcon).toString('base64')}`;
    }
    
    const iconData = JSON.parse(jsonMatch[0]);
    console.log(`Icon generated for ${appName}:`, iconData.description);
    
    return iconData.iconUrl || `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#4F46E5" rx="12"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="white">${appName.charAt(0).toUpperCase()}</text></svg>`).toString('base64')}`;
    
  } catch (error) {
    console.error("Icon generation failed:", error);
    // Create a fallback icon with the first letter of the app name
    const firstLetter = appName.charAt(0).toUpperCase();
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#6366F1" rx="12"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="white">${firstLetter}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svgIcon).toString('base64')}`;
  }
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
