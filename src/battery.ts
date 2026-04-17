import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

export interface BatteryResult {
    level: number;
    deviceName: string;
}

const __dir = dirname(fileURLToPath(import.meta.url));

// Locate the compiled helper: same dir as plugin.js when built,
// or in sdPlugin/bin/ when running from src/ via tsx
const helperPath = [
    join(__dir, "airpods_battery"),
    join(__dir, "..", "com.joshmiller83.headphone-battery-level.sdPlugin", "bin", "airpods_battery"),
].find(existsSync) ?? join(__dir, "airpods_battery");

/**
 * Read battery level from a connected Bluetooth headphone via the IOBluetooth private API.
 * Uses a compiled Objective-C helper that calls batteryPercentCombined/batteryPercentSingle
 * on IOBluetoothDevice — the same source macOS uses for its own Bluetooth menu bar indicator.
 *
 * @param targetName  Partial device name to match (case-insensitive), e.g. "AirPods Max"
 * @returns Battery percentage (1–100) or null if device not found / not connected
 */
export function readBatteryLevel(
    targetName: string = "AirPods Max"
): Promise<BatteryResult | null> {
    return new Promise((resolve) => {
        execFile(helperPath, [targetName], { timeout: 5_000 }, (err, stdout) => {
            if (err) {
                resolve(null);
                return;
            }
            const level = parseInt(stdout.trim(), 10);
            if (isNaN(level) || level < 0) {
                resolve(null);
            } else {
                resolve({ level, deviceName: targetName });
            }
        });
    });
}
