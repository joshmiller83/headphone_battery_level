/**
 * Standalone BLE battery read — no Stream Deck needed.
 * Run: npm run test:battery
 *
 * Make sure your AirPods Max are powered on. First run triggers macOS Bluetooth permission.
 */
import { readBatteryLevel } from "../src/battery.js";

const target = process.argv[2] ?? "AirPods Max";

console.log(`Scanning for "${target}" (up to 12s)…`);

const result = await readBatteryLevel(target);

if (result) {
    console.log(`✓ ${result.deviceName} — ${result.level}% (address: ${result.address})`);
} else {
    console.log(`✗ Device not found or battery service unavailable.`);
    console.log(`  Tips:`);
    console.log(`  • Make sure "${target}" is powered on and in range`);
    console.log(`  • Try: npm run test:battery "My Headphones" (partial name match)`);
    console.log(`  • First run may require approving Bluetooth access in macOS System Settings`);
}

process.exit(0);
