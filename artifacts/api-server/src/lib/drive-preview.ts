import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const MAX_PREVIEW_EDGE = 1600;
const MAX_PDF_PAGES = 25;
const MAX_PREVIEW_OUTPUT_BYTES = 8 * 1024 * 1024;
const COMMAND_TIMEOUT_MS = 15_000;

export const MAX_PREVIEW_INPUT_BYTES = 25 * 1024 * 1024;

type PreviewInput = {
  bytes: Buffer;
  mimeType: string;
  page: number;
};

type PreviewOutput = {
  bytes: Buffer;
  pageCount: number;
};

function previewError(message: string, status: 413 | 415 | 422 = 422) {
  return Object.assign(new Error(message), { status });
}

async function run(command: string, args: string[]) {
  try {
    await execFileAsync(command, args, {
      timeout: COMMAND_TIMEOUT_MS,
      maxBuffer: 1024 * 1024,
      windowsHide: true,
    });
  } catch (error) {
    const timedOut = (error as { killed?: boolean }).killed;
    throw previewError(
      timedOut ? "Preview conversion timed out." : "This file could not be converted into a safe review preview.",
    );
  }
}

async function pageCount(pdfPath: string) {
  try {
    const { stdout } = await execFileAsync("pdfinfo", [pdfPath], {
      timeout: COMMAND_TIMEOUT_MS,
      maxBuffer: 1024 * 1024,
      windowsHide: true,
    });
    const match = stdout.match(/^Pages:\s+(\d+)\s*$/m);
    const count = match ? Number(match[1]) : 0;
    if (!Number.isInteger(count) || count < 1) throw new Error("missing page count");
    if (count > MAX_PDF_PAGES) {
      throw previewError(`Review preview supports PDFs up to ${MAX_PDF_PAGES} pages.`, 413);
    }
    return count;
  } catch (error) {
    if ((error as { status?: number }).status) throw error;
    throw previewError("This PDF could not be inspected for a safe review preview.");
  }
}

async function watermarkPng(inputPath: string, outputPath: string) {
  // This rasterizes SVG/image input and strips profiles/metadata. The output
  // is a flattened, bounded PNG; no source-format bytes leave this process.
  await run("magick", [
    inputPath,
    "-auto-orient",
    "-thumbnail", `${MAX_PREVIEW_EDGE}x${MAX_PREVIEW_EDGE}>`,
    "-background", "white",
    "-alpha", "remove",
    "-alpha", "off",
    "-colorspace", "sRGB",
    "-strip",
    "-gravity", "southeast",
    "-fill", "rgba(0,0,0,0.62)",
    "-stroke", "none",
    "-font", "DejaVu-Sans",
    "-pointsize", "30",
    "-annotate", "+24+24",
    "REVIEW PREVIEW - NOT FINAL",
    "-define", "png:exclude-chunk=all",
    outputPath,
  ]);
}

async function boundedPng(pathname: string) {
  const info = await stat(pathname);
  if (info.size > MAX_PREVIEW_OUTPUT_BYTES) {
    throw previewError("The generated review preview exceeds the portal safety limit.", 413);
  }
  return readFile(pathname);
}

/**
 * Convert an in-memory Drive source to a one-page watermarked PNG. All
 * intermediate files are held under an isolated OS temporary directory and
 * removed before the request completes.
 */
export async function generateDrivePreview({ bytes, mimeType, page }: PreviewInput): Promise<PreviewOutput> {
  if (bytes.byteLength > MAX_PREVIEW_INPUT_BYTES) {
    throw previewError("This file is larger than the 25 MB review preview limit.", 413);
  }
  const isPdf = mimeType === "application/pdf";
  if (!isPdf && !mimeType.startsWith("image/")) {
    throw previewError("Review preview currently supports Drive images and PDFs only.", 415);
  }
  const dir = await mkdtemp(path.join(tmpdir(), "agency-drive-preview-"));
  try {
    const source = path.join(dir, isPdf ? "source.pdf" : mimeType === "image/svg+xml" ? "source.svg" : "source-image");
    const output = path.join(dir, "review-preview.png");
    await writeFile(source, bytes, { mode: 0o600 });
    if (!isPdf) {
      if (page !== 1) throw previewError("Images have one preview page.", 422);
      await watermarkPng(source, output);
      return { bytes: await boundedPng(output), pageCount: 1 };
    }

    const pages = await pageCount(source);
    if (page < 1 || page > pages) {
      throw previewError(`Preview page must be between 1 and ${pages}.`, 422);
    }
    const rasterPrefix = path.join(dir, "page");
    await run("pdftoppm", [
      "-f", String(page),
      "-l", String(page),
      "-singlefile",
      "-png",
      "-scale-to", String(MAX_PREVIEW_EDGE),
      source,
      rasterPrefix,
    ]);
    await watermarkPng(`${rasterPrefix}.png`, output);
    return { bytes: await boundedPng(output), pageCount: pages };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}