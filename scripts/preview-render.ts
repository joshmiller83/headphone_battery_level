/**
 * Renders battery SVGs at various charge levels and opens an HTML preview in the browser.
 * Run: npm run preview
 */
import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { renderBatteryImage, svgToDataUrl } from "../src/render.js";

const levels: Array<number | null> = [100, 89, 50, 29, 14, 5, null];

const cells = levels.map((level) => {
    const label = level === null ? "disconnected" : `${level}%`;
    const svg = renderBatteryImage(level);
    const dataUrl = svgToDataUrl(svg);
    return `
        <div style="text-align:center; font-family:monospace; color:#ccc;">
            <img src="${dataUrl}" width="144" height="144" style="display:block; border:1px solid #333; border-radius:4px;"/>
            <div style="margin-top:6px;">${label}</div>
        </div>`;
}).join("\n");

const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>Battery Render Preview</title>
    <style>body { background:#111; display:flex; gap:20px; padding:40px; flex-wrap:wrap; }</style>
</head>
<body>${cells}</body>
</html>`;

const outPath = "/tmp/battery-preview.html";
writeFileSync(outPath, html);
console.log(`Preview written → ${outPath}`);
execSync(`open ${outPath}`);
