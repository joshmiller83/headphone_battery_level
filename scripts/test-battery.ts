/**
 * Standalone battery read — no Stream Deck needed.
 * Run: npm run test:battery
 * Run: npm run test:battery "My Device Name"
 */
import { readBatteryLevel } from "../src/battery.js";

const target = process.argv[2] ?? "AirPods Max";

console.log(`Reading battery for "${target}"…`);

const result = await readBatteryLevel(target);

if (result) {
    console.log(`✓ ${result.deviceName} — ${result.level}%`);
} else {
    console.log(`✗ Device not found or not connected.`);
    console.log(`  Make sure "${target}" is powered on and connected to this Mac.`);
    console.log(`  Try: npm run test:battery "My Headphones" (partial name match)`);
}

process.exit(0);
