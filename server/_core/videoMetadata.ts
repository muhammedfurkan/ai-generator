// @ts-ignore - ffprobe-static doesn't have types
import ffprobeStatic from "ffprobe-static";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/**
 * Get video duration from URL using ffprobe
 * @param videoUrl - URL of the video file
 * @returns Duration in seconds, or null if unable to determine
 */
export async function getVideoDuration(
  videoUrl: string
): Promise<number | null> {
  try {
    // Use system ffprobe instead of static binary (which crashes on some linux envs)
    const ffprobePath = "ffprobe";

    // Use ffprobe to get video metadata
    const { stdout } = await execFileAsync(ffprobePath, [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      videoUrl,
    ]);

    const duration = parseFloat(stdout.trim());

    if (isNaN(duration) || duration <= 0) {
      console.warn(
        `[VideoMetadata] Invalid duration detected: ${stdout.trim()}`
      );
      return null;
    }

    console.log(
      `[VideoMetadata] Duration for ${videoUrl.substring(0, 50)}...: ${duration}s`
    );
    return duration;
  } catch (error: any) {
    if (error.signal === "SIGSEGV") {
      console.error(
        `[VideoMetadata] ffprobe crashed (SIGSEGV). This is likely a binary compatibility issue in the current environment.`
      );
    } else {
      console.error(
        `[VideoMetadata] Error getting video duration for ${videoUrl}:`,
        error.message || error
      );
    }
    return null;
  }
}

/**
 * Get video metadata including duration, resolution, etc.
 * @param videoUrl - URL of the video file
 */
export async function getVideoMetadata(videoUrl: string): Promise<{
  duration: number | null;
  width: number | null;
  height: number | null;
} | null> {
  try {
    // Use system ffprobe instead of static binary
    const ffprobePath = "ffprobe";

    // Get comprehensive video metadata
    const { stdout } = await execFileAsync(ffprobePath, [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,duration:format=duration",
      "-of",
      "json",
      videoUrl,
    ]);

    const metadata = JSON.parse(stdout);

    let duration: number | null = null;
    let width: number | null = null;
    let height: number | null = null;

    // Try to get duration from stream first, then format
    if (metadata.streams?.[0]?.duration) {
      duration = parseFloat(metadata.streams[0].duration);
    } else if (metadata.format?.duration) {
      duration = parseFloat(metadata.format.duration);
    }

    // Get resolution
    if (metadata.streams?.[0]?.width) {
      width = parseInt(metadata.streams[0].width);
    }
    if (metadata.streams?.[0]?.height) {
      height = parseInt(metadata.streams[0].height);
    }

    console.log(
      `[VideoMetadata] Metadata for ${videoUrl.substring(0, 50)}...:`,
      { duration, width, height }
    );

    return { duration, width, height };
  } catch (error: any) {
    if (error.signal === "SIGSEGV") {
      console.error(
        `[VideoMetadata] ffprobe crashed (SIGSEGV). This is likely a binary compatibility issue in the current environment.`
      );
    } else {
      console.error(
        `[VideoMetadata] Error getting video metadata for ${videoUrl}:`,
        error.message || error
      );
    }
    return null;
  }
}
