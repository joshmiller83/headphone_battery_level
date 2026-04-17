export type RenderState = number | "not_found" | "permission_denied";

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
    if (pct >= 30) return "#4caf50";
    if (pct >= 15) return "#ff9800";
    return "#f44336";
}

function batterySvg(pct: number): string {
    const fillWidth = Math.round((100 * pct) / 100);
    const color = fillColor(pct);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" fill="#1a1a1a"/>
  <rect x="14" y="56" width="${fillWidth}" height="32" rx="3" fill="${color}"/>
  <rect x="10" y="52" width="112" height="40" rx="5" fill="none" stroke="#ffffff" stroke-width="2"/>
  <rect x="122" y="62" width="8" height="20" rx="3" fill="#ffffff"/>
  <text x="72" y="72" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial,sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${pct}%</text>
</svg>`;
}

function disconnectedSvg(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" fill="#1a1a1a"/>
  <rect x="10" y="52" width="112" height="40" rx="5" fill="none" stroke="#555555" stroke-width="2"/>
  <rect x="122" y="62" width="8" height="20" rx="3" fill="#555555"/>
  <text x="72" y="72" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial,sans-serif" font-size="20" font-weight="bold" fill="#888888">--</text>
</svg>`;
}

function permissionSvg(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" fill="#1a1a1a"/>
  <rect x="10" y="52" width="112" height="40" rx="5" fill="none" stroke="#ff9800" stroke-width="2"/>
  <rect x="122" y="62" width="8" height="20" rx="3" fill="#ff9800"/>
  <text x="72" y="65" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="#ff9800">BT</text>
  <text x="72" y="83" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="#ff9800">off</text>
</svg>`;
}
