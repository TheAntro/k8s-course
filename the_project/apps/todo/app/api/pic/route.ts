import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// TTL for cache (10 minutes)
const CACHE_TTL_MS = 10 * 60 * 1000;

// If IMAGE_CACHE_DIR is set we use a disk-backed cache (shared between processes
// if they mount the same volume). Otherwise fall back to a fast in-memory cache.
const IMAGE_CACHE_DIR = process.env.IMAGE_CACHE_DIR;
const CACHE_FILE = IMAGE_CACHE_DIR
  ? path.join(IMAGE_CACHE_DIR, "cached-image.jpg")
  : null;

const PHOTO_API_URL = process.env.PHOTO_API_URL;

let memoryCache: { buf: Buffer; ts: number } | null = null;

async function ensureCacheDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function readDiskCacheIfFresh(filePath: string) {
  try {
    const stat = await fs.stat(filePath);
    const now = Date.now();
    const mtime = stat.mtimeMs || 0;
    if (now - mtime < CACHE_TTL_MS) {
      const buf = await fs.readFile(filePath);
      return buf;
    }
  } catch {
    // missing or unreadable -> treat as miss
  }
  return null;
}

export async function GET() {
  try {
    const now = Date.now();

    // If disk cache is configured, try to use it first
    if (CACHE_FILE) {
      await ensureCacheDir(IMAGE_CACHE_DIR as string);
      const diskBuf = await readDiskCacheIfFresh(CACHE_FILE);
      if (diskBuf) {
        const headers = new Headers();
        headers.set("Content-Type", "image/jpeg");
        headers.set("Cache-Control", "public, max-age=600");
        return new Response(new Uint8Array(diskBuf), { headers });
      }

      // Miss: fetch, write atomically to disk, and return
      const res = await fetch(`${PHOTO_API_URL}/1200`);
      if (!res.ok) {
        return NextResponse.json(
          { error: "Failed to fetch image" },
          { status: 502 }
        );
      }
      const arrayBuffer = await res.arrayBuffer();
      const buf = Buffer.from(arrayBuffer);

      const tmpPath = CACHE_FILE + ".tmp";
      await fs.writeFile(tmpPath, buf);
      await fs.rename(tmpPath, CACHE_FILE);

      const contentType = res.headers.get("content-type") || "image/jpeg";
      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Cache-Control", "public, max-age=600");
      return new Response(new Uint8Array(buf), { headers });
    }

    // Fallback: simple in-memory cache
    if (memoryCache && now - memoryCache.ts < CACHE_TTL_MS) {
      const headers = new Headers();
      headers.set("Content-Type", "image/jpeg");
      headers.set("Cache-Control", "public, max-age=600");
      return new Response(new Uint8Array(memoryCache.buf), { headers });
    }

    const res = await fetch(`${PHOTO_API_URL}/1200`);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: 502 }
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    memoryCache = { buf, ts: Date.now() };

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=600");
    return new Response(new Uint8Array(buf), { headers });
  } catch (err) {
    return NextResponse.json(
      { error: "Exception fetching image" },
      { status: 500 }
    );
  }
}
