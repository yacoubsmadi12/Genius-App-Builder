import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

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
  const systemPrompt = `You are an expert Flutter developer. Generate a complete Flutter app based on the user's requirements.

Create a production-ready Flutter app with:
1. Proper project structure
2. Material 3 design
3. Clean, maintainable code
4. Proper state management
5. Navigation between screens
6. ${request.backend} backend integration
7. Authentication if needed
8. Responsive design

Return a JSON response with:
- files: object with file paths as keys and file contents as values
- structure: array of file paths showing the project structure
- readme: markdown documentation for the app

Focus on creating a realistic, functional app that matches the description exactly.`;

  const userPrompt = `Create a Flutter app with these specifications:

App Name: ${request.appName}
Backend: ${request.backend}
${request.iconUrl ? `Icon URL: ${request.iconUrl}` : 'Generate appropriate icons'}

Description: ${request.prompt}

Generate the complete Flutter project with all necessary files, proper navigation, and ${request.backend} integration.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as GeneratedApp;
  } catch (error) {
    throw new Error(`Failed to generate Flutter app: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateAppIcon(appName: string, description: string): Promise<string> {
  const prompt = `Create a modern, professional app icon for "${appName}". ${description}. The icon should be simple, recognizable, and work well at small sizes. Use a clean, minimalist design with bold colors.`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data?.[0]?.url || '';
  } catch (error) {
    throw new Error(`Failed to generate app icon: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function enhancePrompt(prompt: string): Promise<string> {
  const systemPrompt = `You are an expert app designer. Enhance the user's app description to include specific technical details, UI/UX requirements, and feature specifications that will help generate a better Flutter app.

Add details about:
- Specific screens and navigation flow
- UI components and layouts
- Color schemes and design style
- Data models and functionality
- User interactions and workflows

Return only the enhanced description.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || prompt;
  } catch (error) {
    console.error("Failed to enhance prompt:", error);
    return prompt;
  }
}
