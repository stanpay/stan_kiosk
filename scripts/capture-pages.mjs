import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../screenshots");
const BASE = process.env.KIOSK_URL ?? "http://localhost:5173";

/** 언어 제외 각 메뉴 페이지 */
const PAGES = [
  { path: "/", name: "01-제주여행자센터" },
  { path: "/stores", name: "02-매장정보" },
  { path: "/facilities", name: "03-편의시설" },
  { path: "/tourism", name: "04-관광정보" },
  { path: "/transport", name: "05-교통정보" },
  { path: "/faq", name: "06-FAQ" },
  { path: "/map", name: "07-원도심지도" },
];

async function dismissIdle(page) {
  const idle = page.getByRole("button", { name: "아무곳이나 터치해주세요" });
  if (await idle.isVisible({ timeout: 2000 }).catch(() => false)) {
    await idle.click({ force: true });
    await page.waitForTimeout(500);
  }
}

async function waitForPageReady(page, route) {
  await page.waitForLoadState("domcontentloaded");
  await dismissIdle(page);

  // maps / images settle
  if (["/stores", "/facilities", "/tourism", "/map"].includes(route)) {
    await page.waitForTimeout(3500);
  } else {
    await page.waitForTimeout(1200);
  }

  // wait fonts
  await page.evaluate(() => document.fonts?.ready);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 2, // → 2160×3840 상당
    locale: "ko-KR",
  });
  const page = await context.newPage();

  const results = [];

  for (const item of PAGES) {
    const url = `${BASE}${item.path}`;
    console.log(`Capturing ${item.name} … ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await waitForPageReady(page, item.path);

    const frame = page.locator(".kiosk-frame");
    await frame.waitFor({ state: "visible", timeout: 10_000 });

    const file = path.join(OUT_DIR, `${item.name}.png`);
    await frame.screenshot({
      path: file,
      type: "png",
      animations: "disabled",
    });

    const box = await frame.boundingBox();
    results.push({
      name: item.name,
      file,
      cssSize: box ? `${Math.round(box.width)}×${Math.round(box.height)}` : "?",
      pngPx: "2160×3840 (approx @2x)",
    });
    console.log(`  saved ${file}`);
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
