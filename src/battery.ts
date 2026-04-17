import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

export interface BatteryResult {
    level: number;
    deviceName: string;
}

export type BatteryError = "not_found" | "permission_denied";

const __dir = dirname(fileURLToPath(import.meta.url));

// Locate the compiled helper: same dir as plugin.js when built,
// or in sdPlugin/bin/ when running from src/ via tsx
const helperPath = [
    join(__dir, "airpods_battery"),
    join(__dir, "..", "com.joshmiller83.headphone-battery-level.sdPlugin", "bin", "airpods_battery"),
].find(existsSync) ?? join(__dir, "airpods_battery");

/**
 * Read battery level from a connected Bluetooth headphone via the IOBluetooth private API.
 *
 * Returns the battery result, or a BatteryError string:
 *   "not_found"        – device not connected / not found
 *   "permission_denied" – Stream Deck needs Bluetooth access in
 *                         System Settings → Privacy & Security → Bluetooth
 */
export function readBatteryLevel(
    targetName: string = "AirPods Max"
): Promise<BatteryResult | BatteryError> {
    return new Promise((resolve) => {
        execFile(helperPath, [targetName], { timeout: 5_000 }, (err, stdout) => {
            if (!err) {
                const level = parseInt(stdout.trim(), 10);
                if (!isNaN(level) && level > 0) {
                    resolve({ level, deviceName: targetName });
                    return;
                }
            }
            // Exit code 2 = Bluetooth TCC permission denied
            const exitCode = (err as NodeJS.ErrnoException & { code?: number })?.code;
            if (exitCode === 2) {
                resolve("permission_denied");
            } else {
                resolve("not_found");
            }
        });
    });
}
