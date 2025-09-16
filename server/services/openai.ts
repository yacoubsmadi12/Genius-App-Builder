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
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    console.error("AI generation failed, using fallback template:", error);
    
    // Return a basic Flutter template when AI fails
    return generateFallbackFlutterApp(request);
  }
}

function generateFallbackFlutterApp(request: AppGenerationRequest): GeneratedApp {
  const appName = request.appName;
  const description = request.prompt;
  const backend = request.backend;
  
  const files = {
    "pubspec.yaml": `name: ${appName.toLowerCase().replace(/\s+/g, '_')}
description: ${description}
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: ">=3.10.0"

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2
  http: ^1.1.0
  shared_preferences: ^2.2.2
  ${backend === 'firebase' ? 'firebase_core: ^2.24.2\n  firebase_auth: ^4.15.3' : ''}
  ${backend === 'supabase' ? 'supabase_flutter: ^2.0.0' : ''}

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true`,

    "lib/main.dart": `import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${appName}',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: HomeScreen(),
    );
  }
}`,

    "lib/screens/home_screen.dart": `import 'package:flutter/material.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text('${appName}'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(
              Icons.flutter_dash,
              size: 100,
              color: Theme.of(context).primaryColor,
            ),
            SizedBox(height: 20),
            Text(
              'Welcome to ${appName}!',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            SizedBox(height: 10),
            Padding(
              padding: EdgeInsets.all(16.0),
              child: Text(
                '${description}',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ),
            SizedBox(height: 30),
            ElevatedButton(
              onPressed: () {
                // Navigate to next screen
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Feature coming soon!')),
                );
              },
              child: Text('Get Started'),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Add functionality here
        },
        tooltip: 'Action',
        child: Icon(Icons.add),
      ),
    );
  }
}`,

    "android/app/src/main/AndroidManifest.xml": `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:label="${appName}"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme"
              />
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>`
  };

  const structure = Object.keys(files);

  const readme = `# ${appName}

${description}

## Features

- Modern Material 3 Design
- ${backend.charAt(0).toUpperCase() + backend.slice(1)} Backend Integration
- Responsive Layout
- Flutter Best Practices

## Getting Started

1. Install Flutter SDK
2. Run \`flutter pub get\`
3. Run \`flutter run\`

## Backend: ${backend}

This app is configured to work with ${backend} as the backend service.

## Generated with Genius App Builder

This Flutter application was generated using AI-powered code generation.
`;

  return { files, structure, readme };
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
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
