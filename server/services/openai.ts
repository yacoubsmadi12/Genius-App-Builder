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

  const prompt = `You are a senior Flutter developer and project generator. Generate a complete, production-ready Flutter project based on the user's detailed requirements.

## Project Specifications:
- App Name: ${request.appName}
- Backend: ${request.backend}
- ${request.iconUrl ? `Icon URL: ${request.iconUrl}` : 'Generate appropriate icons'}
- Requirements: ${request.prompt}

## Technical Requirements:
- Flutter SDK: Latest stable with null-safety
- State Management: Riverpod (flutter_riverpod)
- Architecture: Feature-based folders (lib/main.dart, lib/models, lib/screens, lib/widgets, lib/services, lib/providers, lib/utils)
- Navigation: Named routes with proper navigation flow
- ${request.backend} backend integration with proper authentication
- Material 3 design with responsive layouts
- Accessibility support and clean code with comments

## Generate Multiple Screens Based on App Type:
### For Story/Content Apps:
- Splash screen with animation
- Onboarding (2-3 slides)
- Authentication (login/signup/forgot password)
- Home screen with content lists
- Content generation/creation screen
- Content detail/reader screen
- Saved/favorites screen
- Settings screen with theme toggle

### For E-commerce Apps:
- Splash, Onboarding, Auth
- Home with categories and products
- Product listing and search
- Product details with reviews
- Shopping cart and checkout
- Profile and order history
- Settings and preferences

### For Social Apps:
- Splash, Onboarding, Auth
- Feed/timeline screen
- Profile screen
- Create post/content screen
- Chat/messaging screen
- Notifications screen
- Settings screen

## Required Dependencies (include in pubspec.yaml):
- flutter_riverpod
- firebase_core, firebase_auth, cloud_firestore (if Firebase)
- supabase_flutter (if Supabase)
- shared_preferences or hive
- http or dio
- intl, flutter_localizations
- path_provider
- share_plus
- flutter_svg
- cached_network_image
- image_picker (if needed)
- flutter_local_notifications (if needed)

## Code Quality Requirements:
- Use modern Flutter patterns (null-safety, const constructors)
- Implement proper error handling
- Add loading states and user feedback
- Include form validation where applicable
- Use proper theming (light/dark mode support)
- Add meaningful comments
- Follow Flutter best practices

## File Structure to Generate:
1. pubspec.yaml with all required dependencies
2. lib/main.dart with Riverpod setup and navigation
3. lib/models/ with data models
4. lib/screens/ with all application screens
5. lib/widgets/ with reusable components
6. lib/services/ with API and business logic
7. lib/providers/ with Riverpod state providers
8. lib/utils/ with helpers and constants
9. lib/theme/ with theme configuration
10. README.md with setup instructions

## Response Format:
Return ONLY a valid JSON with this exact structure:
{
  "files": {
    "file_path": "complete_file_content",
    ...
  },
  "structure": ["array", "of", "file", "paths"],
  "readme": "complete markdown documentation"
}

Generate a comprehensive, production-ready Flutter app that fully implements the user's requirements with multiple screens, proper navigation, state management, and modern Flutter practices.`;

  // Add retry mechanism with exponential backoff
  let lastError: any;
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting AI generation (attempt ${attempt}/${maxRetries})...`);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      
      const parsedResult = JSON.parse(jsonMatch[0]);
      console.log(`AI generation successful on attempt ${attempt}`);
      return parsedResult as GeneratedApp;
      
    } catch (error: any) {
      lastError = error;
      console.error(`AI generation attempt ${attempt} failed:`, error.message);
      
      // Don't retry on certain errors
      if (error.status === 400 || error.status === 401 || error.status === 403) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  console.error("All AI generation attempts failed, using enhanced fallback template:", lastError);
  return generateAdvancedFallbackFlutterApp(request);
}

function generateAdvancedFallbackFlutterApp(request: AppGenerationRequest): GeneratedApp {
  const appName = request.appName;
  const description = request.prompt;
  const backend = request.backend;
  const packageName = appName.toLowerCase().replace(/\s+/g, '_');
  
  const files = {
    "pubspec.yaml": `name: ${packageName}
description: ${description}
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: ">=3.10.0"

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  flutter_riverpod: ^2.4.9
  shared_preferences: ^2.2.2
  http: ^1.1.0
  ${backend === 'firebase' ? 'firebase_core: ^2.24.2\n  firebase_auth: ^4.15.3\n  cloud_firestore: ^4.13.6' : ''}
  ${backend === 'supabase' ? 'supabase_flutter: ^2.0.0' : ''}

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1

flutter:
  uses-material-design: true`,

    "lib/main.dart": `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
${backend === 'firebase' ? 'import \'package:firebase_core/firebase_core.dart\';\nimport \'firebase_options.dart\';' : ''}
import 'screens/splash_screen.dart';
import 'screens/home_screen.dart';
import 'screens/settings_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  ${backend === 'firebase' ? 'await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);' : ''}
  runApp(ProviderScope(child: MyApp()));
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
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple, 
          brightness: Brightness.dark
        ),
        useMaterial3: true,
      ),
      themeMode: ThemeMode.system,
      initialRoute: '/',
      routes: {
        '/': (context) => SplashScreen(),
        '/home': (context) => HomeScreen(),
        '/settings': (context) => SettingsScreen(),
      },
    );
  }
}`,

    "lib/screens/splash_screen.dart": `import 'package:flutter/material.dart';

class SplashScreen extends StatefulWidget {
  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> 
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(seconds: 2),
      vsync: this,
    );
    _animation = CurvedAnimation(parent: _controller, curve: Curves.elasticOut);
    _controller.forward();
    
    Future.delayed(Duration(seconds: 3), () {
      Navigator.pushReplacementNamed(context, '/home');
    });
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.primary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ScaleTransition(
              scale: _animation,
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Icon(
                  Icons.auto_stories,
                  size: 80,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
            ),
            SizedBox(height: 30),
            Text(
              '${appName}',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 10),
            Text(
              'AI-Powered App Generation',
              style: TextStyle(
                fontSize: 16,
                color: Colors.white.withOpacity(0.9),
              ),
            ),
          ],
        ),
      ),
    );
  }
}`,

    "lib/screens/home_screen.dart": `import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${appName}'),
        actions: [
          IconButton(
            icon: Icon(Icons.settings),
            onPressed: () => Navigator.pushNamed(context, '/settings'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Theme.of(context).colorScheme.primary,
                    Theme.of(context).colorScheme.primaryContainer,
                  ],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome to ${appName}!',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Ready to create something amazing?',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.9),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              height: 120,
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Create feature coming soon!')),
                  );
                },
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.add_circle, size: 48),
                    SizedBox(height: 8),
                    Text(
                      'Create New Project',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 30),
            Text(
              'Features',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            GridView.count(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.2,
              children: [
                _buildFeatureCard(context, 'AI Generation', Icons.auto_awesome, Colors.blue),
                _buildFeatureCard(context, 'Templates', Icons.dashboard, Colors.green),
                _buildFeatureCard(context, 'Export', Icons.download, Colors.orange),
                _buildFeatureCard(context, 'Share', Icons.share, Colors.purple),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildFeatureCard(BuildContext context, String title, IconData icon, Color color) {
    return Card(
      child: InkWell(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('\$title feature coming soon!')),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 40, color: color),
              SizedBox(height: 12),
              Text(
                title,
                style: TextStyle(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}`,

    "lib/screens/settings_screen.dart": `import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Settings'),
      ),
      body: ListView(
        padding: EdgeInsets.all(16),
        children: [
          _buildSection(
            context,
            'Appearance',
            [
              ListTile(
                leading: Icon(Icons.palette),
                title: Text('Theme'),
                subtitle: Text('System'),
                trailing: Icon(Icons.chevron_right),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Theme settings coming soon!')),
                  );
                },
              ),
            ],
          ),
          SizedBox(height: 20),
          _buildSection(
            context,
            'App',
            [
              ListTile(
                leading: Icon(Icons.info),
                title: Text('About'),
                subtitle: Text('Version 1.0.0'),
                onTap: () => _showAboutDialog(context),
              ),
              ListTile(
                leading: Icon(Icons.feedback),
                title: Text('Send Feedback'),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Feedback feature coming soon!')),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildSection(BuildContext context, String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ),
        Card(
          margin: EdgeInsets.zero,
          child: Column(children: children),
        ),
      ],
    );
  }
  
  void _showAboutDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: '${appName}',
      applicationVersion: '1.0.0',
      applicationIcon: Icon(Icons.auto_stories, size: 64),
      children: [
        Text('${description}'),
        SizedBox(height: 16),
        Text('Built with Flutter and powered by AI.'),
      ],
    );
  }
}`,

    "README.md": `# ${appName}

${description}

## Features

- Modern Material 3 Design with Dark/Light theme
- Backend Integration
- Responsive Layout
- State Management with Riverpod
- Flutter Best Practices

## Getting Started

1. Install Flutter SDK
2. Run flutter pub get
3. Configure your backend
4. Run flutter run

## Generated with Genius App Builder

This Flutter application was generated using AI-powered code generation.
`
  };

  // Add Firebase options file when using Firebase backend
  if (backend === 'firebase') {
    files["lib/firebase_options.dart"] = `// File generated by FlutterFire CLI.
// ignore_for_file: lines_longer_than_80_chars, avoid_classes_with_only_static_members
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// \`\`\`dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// \`\`\`
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'demo-api-key-web',
    appId: '1:demo-project:web:demo-app-id',
    messagingSenderId: 'demo-sender-id',
    projectId: 'demo-project-id',
    authDomain: 'demo-project-id.firebaseapp.com',
    storageBucket: 'demo-project-id.appspot.com',
    measurementId: 'G-DEMO-MEASUREMENT-ID',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'demo-api-key-android',
    appId: '1:demo-project:android:demo-app-id',
    messagingSenderId: 'demo-sender-id',
    projectId: 'demo-project-id',
    storageBucket: 'demo-project-id.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'demo-api-key-ios',
    appId: '1:demo-project:ios:demo-app-id',
    messagingSenderId: 'demo-sender-id',
    projectId: 'demo-project-id',
    storageBucket: 'demo-project-id.appspot.com',
    iosBundleId: 'com.example.${packageName}',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'demo-api-key-macos',
    appId: '1:demo-project:macos:demo-app-id',
    messagingSenderId: 'demo-sender-id',
    projectId: 'demo-project-id',
    storageBucket: 'demo-project-id.appspot.com',
    iosBundleId: 'com.example.${packageName}',
  );
}
`;
  }

  const structure = Object.keys(files);
  
  return { files, structure, readme: files["README.md"] };
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
