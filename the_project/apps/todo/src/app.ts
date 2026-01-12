import express, { Request, Response } from "express";
import expressEjsLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = "/app/cache"; // This will be your PVC mount point in Kubernetes
const CACHE_FILE = path.join(CACHE_DIR, "cached-image.jpg");
const CACHE_INFO_FILE = path.join(CACHE_DIR, "cache-info.json");
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Ensure cache directory exists
async function ensureCacheDir(): Promise<void> {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

// Download image and save to file
async function downloadImage(url: string, filePath: string): Promise<void> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  
  const buffer = await response.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(buffer));
}

// Check if cache is still valid
async function isCacheValid(): Promise<boolean> {
  try {
    await fs.access(CACHE_FILE);
    await fs.access(CACHE_INFO_FILE);
    
    const cacheInfoData = await fs.readFile(CACHE_INFO_FILE, 'utf8');
    const cacheInfo = JSON.parse(cacheInfoData);
    const now = Date.now();
    
    return (now - cacheInfo.timestamp) < CACHE_DURATION;
  } catch {
    return false;
  }
}

// Get image (cached or fresh)
async function getImage(): Promise<string> {
  await ensureCacheDir();
  
  // If cache is valid, return existing image
  if (await isCacheValid()) {
    console.log("Using cached image");
    return "/cached-image.jpg";
  }
  
  // Download new image
  console.log("Downloading new image...");
  await downloadImage("https://picsum.photos/1200", CACHE_FILE);
  
  // Save cache info
  const cacheInfo = { timestamp: Date.now() };
  await fs.writeFile(CACHE_INFO_FILE, JSON.stringify(cacheInfo));
  
  console.log("New image cached");
  return "/cached-image.jpg";
}

// Set view engine and layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../public")));

// Serve cached images from cache directory
app.use("/cached-image.jpg", express.static(CACHE_FILE));

app.use(expressEjsLayouts);
app.set("layout", "layouts/main");

// Routes
app.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const imageUrl = await getImage();
    res.render("index", { 
      title: "Todo App - Home",
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error("Error:", error);
    res.render("index", { 
      title: "Todo App - Home",
      imageUrl: ""
    });
  }
});

// Server configuration
const PORT: number = parseInt(process.env.PORT || "3000", 10);

app.listen(PORT, (): void => {
  console.log(`Server started on port ${PORT}`);
});