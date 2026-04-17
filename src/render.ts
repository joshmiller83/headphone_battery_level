export type RenderState = number | "not_found" | "permission_denied";

// Battery geometry (144x144 viewBox)
const B = {
    x: 6,       // battery body left
    y: 44,      // battery body top
    w: 120,     // battery body width (right edge at x=126)
    h: 56,      // battery body height (bottom at y=100)
    r: 8,       // corner radius
    stroke: 3,  // border width
    nubW: 10,   // terminal nub width
    nubH: 28,   // terminal nub height
} as const;

// Inner fill area (inset from stroke + small padding)
const pad = 5;
const fillX = B.x + pad;
const fillY = B.y + pad;
const fillMaxW = B.w - pad * 2 - B.nubW + 2; // stop before the nub
const fillH = B.h - pad * 2;
const fillR = 5;

// Nub position (attached to right side, vertically centered)
const nubX = B.x + B.w;
const nubY = B.y + (B.h - B.nubH) / 2;

// Text center
const textX = B.x + (B.w - B.nubW / 2) / 2;
const textY = B.y + B.h / 2;

export function renderBatteryImage(state: RenderState): string {
    if (state === "permission_denied") return permissionSvg();
    if (state === "not_found") return disconnectedSvg();
    const pct = Math.max(0, Math.min(100, state));
    return batterySvg(pct);
}

export function svgToDataUrl(svg: string): string {
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function fillColor(pct: number): string {
    if (pct >= 30) return "#2db82d";
    if (pct >= 15) return "#ff9800";
    return "#f44336";
}

function batterySvg(pct: number): string {
    const fillWidth = Math.round((fillMaxW * pct) / 100);
    const color = fillColor(pct);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" fill="#000000"/>
  <rect x="${fillX}" y="${fillY}" width="${fillWidth}" height="${fillH}" rx="${fillR}" fill="${color}"/>
  <rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" rx="${B.r}"
        fill="none" stroke="#ffffff" stroke-width="${B.stroke}"/>
  <rect x="${nubX}" y="${nubY}" width="${B.nubW}" height="${B.nubH}" rx="4" fill="#ffffff"/>
  <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="#ffffff">${pct}%</text>
</svg>`;
}

function disconnectedSvg(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" fill="#000000"/>
  <rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" rx="${B.r}"
        fill="none" stroke="#555555" stroke-width="${B.stroke}"/>
  <rect x="${nubX}" y="${nubY}" width="${B.nubW}" height="${B.nubH}" rx="4" fill="#555555"/>
  <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="#888888">--</text>
</svg>`;
}

function permissionSvg(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" fill="#000000"/>
  <rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" rx="${B.r}"
        fill="none" stroke="#ff9800" stroke-width="${B.stroke}"/>
  <rect x="${nubX}" y="${nubY}" width="${B.nubW}" height="${B.nubH}" rx="4" fill="#ff9800"/>
  <text x="${textX}" y="${textY - 10}" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial,sans-serif" font-size="18" font-weight="bold" fill="#ff9800">BT</text>
  <text x="${textX}" y="${textY + 12}" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial,sans-serif" font-size="18" font-weight="bold" fill="#ff9800">off</text>
</svg>`;
}
