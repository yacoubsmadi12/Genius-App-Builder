import { storage } from "../storage";
import { generateFlutterApp, generateAppIcon, enhancePrompt } from "./openai";
import * as fs from "fs";
import * as path from "path";
import archiver from "archiver";

export interface GenerationProgress {
  step: string;
  completed: string[];
  current: string;
  total: number;
}

const GENERATION_STEPS = [
  "Creating Flutter project",
  "Generating pages", 
  "Creating images",
  "Linking navigation",
  "Setting up backend",
  "Building ZIP file"
];

export async function startAppGeneration(generationId: string) {
  try {
    const generation = await storage.getAppGeneration(generationId);
    if (!generation) {
      throw new Error("Generation not found");
    }

    // Update status to generating
    await storage.updateAppGeneration(generationId, {
      status: "generating",
      progress: {
        step: GENERATION_STEPS[0],
        completed: [],
        current: GENERATION_STEPS[0],
        total: GENERATION_STEPS.length
      }
    });

    // Step 1: Creating Flutter project
    await updateProgress(generationId, 0);
    await sleep(2000);

    // Step 2: Enhance prompt
    await updateProgress(generationId, 1);
    const enhancedPrompt = await enhancePrompt(generation.prompt);
    await sleep(1500);

    // Step 3: Generate icon if needed
    await updateProgress(generationId, 2);
    let iconUrl = generation.iconUrl;
    if (!iconUrl) {
      iconUrl = await generateAppIcon(generation.appName, generation.prompt);
      await storage.updateAppGeneration(generationId, { iconUrl });
    }
    await sleep(2000);

    // Step 4: Generate Flutter app
    await updateProgress(generationId, 3);
    const generatedApp = await generateFlutterApp({
      appName: generation.appName,
      prompt: enhancedPrompt,
      backend: generation.backend,
      iconUrl
    });
    await sleep(2000);

    // Step 5: Setup backend configuration
    await updateProgress(generationId, 4);
    await addBackendConfiguration(generatedApp, generation.backend);
    await sleep(1500);

    // Step 6: Create ZIP file
    await updateProgress(generationId, 5);
    const zipPath = await createZipFile(generationId, generatedApp);
    await sleep(1000);

    // Complete generation
    await storage.updateAppGeneration(generationId, {
      status: "completed",
      resultUrl: zipPath,
      progress: {
        step: "Completed",
        completed: GENERATION_STEPS,
        current: "Completed",
        total: GENERATION_STEPS.length
      }
    });

    // Update user's generation count
    const user = await storage.getUser(generation.userId);
    if (user) {
      const subscription = await storage.getUserSubscription(generation.userId);
      if (subscription) {
        const used = parseInt(subscription.generationsUsed) + 1;
        await storage.updateSubscription(generation.userId, {
          generationsUsed: used.toString()
        });
      }
    }

  } catch (error) {
    console.error("App generation failed:", error);
    await storage.updateAppGeneration(generationId, {
      status: "failed",
      progress: {
        step: "Failed",
        completed: [],
        current: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        total: GENERATION_STEPS.length
      }
    });
  }
}

async function updateProgress(generationId: string, stepIndex: number) {
  const completed = GENERATION_STEPS.slice(0, stepIndex);
  const current = GENERATION_STEPS[stepIndex];
  
  await storage.updateAppGeneration(generationId, {
    progress: {
      step: current,
      completed,
      current,
      total: GENERATION_STEPS.length
    }
  });
}

async function addBackendConfiguration(app: any, backend: string) {
  // Add backend-specific configuration files
  switch (backend) {
    case "firebase":
      app.files["android/app/google-services.json"] = `{
  "project_info": {
    "project_number": "your-project-number",
    "project_id": "your-project-id"
  }
}`;
      app.files["lib/firebase_options.dart"] = `// Firebase configuration
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform => android;
  
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'your-api-key',
    appId: 'your-app-id',
    messagingSenderId: 'your-sender-id',
    projectId: 'your-project-id',
  );
}`;
      break;
    case "supabase":
      app.files["lib/supabase_config.dart"] = `const String supabaseUrl = 'your-supabase-url';
const String supabaseAnonKey = 'your-anon-key';`;
      break;
    case "nodejs":
      app.files["lib/api_config.dart"] = `const String apiBaseUrl = 'your-api-url';
const String apiKey = 'your-api-key';`;
      break;
  }
}

async function createZipFile(generationId: string, app: any): Promise<string> {
  const zipPath = `./downloads/${generationId}.zip`;
  const dir = path.dirname(zipPath);
  
  // Ensure downloads directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      resolve(`/api/download/${generationId}`);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Add all generated files to the archive
    Object.entries(app.files).forEach(([filePath, content]) => {
      archive.append(content as string, { name: filePath });
    });

    archive.append(app.readme, { name: 'README.md' });
    archive.finalize();
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
