#!/usr/bin/env node

import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 667 },
];

const COOKIE_SELECTORS = [
  "#onetrust-accept-btn-handler",
  ".cookie-consent button",
  '[data-testid="cookie-accept"]',
  "#cookie-accept",
  ".cc-btn.cc-allow",
  'button[aria-label="Accept cookies"]',
  "#accept-cookie",
  ".js-cookie-consent-agree",
];

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function validateUrl(raw) {
  const parsed = new URL(raw);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Disallowed protocol: ${parsed.protocol}`);
  }
  return parsed.href;
}

function validateName(name) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(name)) {
    throw new Error(
      `Invalid name: must be kebab-case (alphanumeric, hyphens, underscores). Got "${name}"`,
    );
  }
  return name;
}

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--url") parsed.url = args[++i];
    else if (args[i] === "--name") parsed.name = args[++i];
    else if (args[i] === "--output-dir") parsed.outputDir = args[++i];
    else if (args[i] === "--sites") parsed.sitesFile = args[++i];
  }
  return parsed;
}

async function buildSiteList(parsed) {
  if (parsed.sitesFile) {
    const raw = await readFile(parsed.sitesFile, "utf-8");
    const config = JSON.parse(raw);
    if (!config.outputDir || !Array.isArray(config.sites)) {
      throw new Error("sites JSON must have { outputDir, sites: [{ url, name }] }");
    }
    const sites = config.sites.map((s) => ({
      url: validateUrl(s.url),
      name: validateName(s.name),
      outputDir: config.outputDir,
    }));
    return sites;
  }

  if (!parsed.url || !parsed.name || !parsed.outputDir) {
    throw new Error(
      "Usage: --url <url> --name <name> --output-dir <dir>\n" +
      "       --sites <json-file>",
    );
  }
  return [{ url: validateUrl(parsed.url), name: validateName(parsed.name), outputDir: parsed.outputDir }];
}

async function dismissCookieBanner(page) {
  for (const selector of COOKIE_SELECTORS) {
    try {
      await page.click(selector, { timeout: 3000 });
      await page.waitForTimeout(500);
      return;
    } catch {
      // selector not found — try next
    }
  }
}

function safeSiteDir(outputDir, name) {
  const resolved = resolve(outputDir, name);
  if (!resolved.startsWith(resolve(outputDir))) {
    throw new Error("Path traversal detected");
  }
  return resolved;
}

async function takeSiteScreenshots(browser, { url, name, outputDir }) {
  const siteDir = safeSiteDir(outputDir, name);
  await mkdir(siteDir, { recursive: true });

  const results = await Promise.all(
    VIEWPORTS.map(async (viewport) => {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        userAgent: USER_AGENT,
      });
      const page = await context.newPage();

      try {
        const response = await page.goto(url, {
          waitUntil: "load",
          timeout: 30000,
        });
        await page.waitForTimeout(2000);

        const status = response?.status() ?? 0;
        if (status === 403 || status === 429) {
          return {
            device: viewport.name,
            success: false,
            error: `HTTP ${status} — blocked or rate-limited`,
          };
        }

        await dismissCookieBanner(page);

        const filePath = join(siteDir, `${viewport.name}.png`);
        await page.screenshot({ path: filePath, fullPage: true });
        return { device: viewport.name, success: true, path: filePath };
      } catch (error) {
        return {
          device: viewport.name,
          success: false,
          error: error.message,
        };
      } finally {
        await context.close();
      }
    }),
  );

  return { site: name, url, results };
}

try {
  const parsed = parseArgs(process.argv.slice(2));
  const sites = await buildSiteList(parsed);

  const browser = await chromium.launch({ headless: true });
  try {
    const output = await Promise.all(
      sites.map((site) => takeSiteScreenshots(browser, site)),
    );
    console.log(JSON.stringify(output, null, 2));
  } finally {
    await browser.close();
  }
} catch (error) {
  console.log(JSON.stringify({ success: false, error: error.message }));
  process.exit(1);
}
