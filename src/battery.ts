import { withBindings } from "@stoprocent/noble";

export interface BatteryResult {
    level: number;
    deviceName: string;
    address: string;
}

/**
 * Read battery level from a BLE device via GATT Battery Service (0x180F / characteristic 0x2A19).
 *
 * AirPods Max (and most modern BT headphones) expose battery this way. Standard macOS ioreg/
 * system_profiler do NOT expose AirPods battery — BLE GATT is the only reliable path.
 *
 * Strategy:
 *  1. If a cached address is provided, attempt direct connect first (fast path, skips scan).
 *  2. Fall back to scanning for the Battery Service and matching by device name.
 */
export async function readBatteryLevel(
    targetName: string = "AirPods Max",
    cachedAddress?: string,
    timeoutMs: number = 12_000
): Promise<BatteryResult | null> {
    const noble = withBindings("mac");

    try {
        await noble.waitForPoweredOnAsync(5_000);
    } catch {
        return null;
    }

    // Fast path: reconnect using a previously discovered address
    if (cachedAddress) {
        const result = await tryDirectConnect(noble, cachedAddress, targetName);
        if (result) return result;
    }

    // Scan path: discover via Battery Service advertisement
    return await scanAndConnect(noble, targetName, timeoutMs);
}

async function tryDirectConnect(
    noble: ReturnType<typeof withBindings>,
    address: string,
    deviceName: string
): Promise<BatteryResult | null> {
    try {
        const peripheral = await noble.connectAsync(address);
        return await readFromPeripheral(peripheral, deviceName, address);
    } catch {
        return null;
    }
}

async function scanAndConnect(
    noble: ReturnType<typeof withBindings>,
    targetName: string,
    timeoutMs: number
): Promise<BatteryResult | null> {
    return new Promise(async (resolve) => {
        const timeout = setTimeout(async () => {
            await noble.stopScanningAsync().catch(() => {});
            resolve(null);
        }, timeoutMs);

        noble.on("discover", async (peripheral) => {
            const name = peripheral.advertisement?.localName ?? "";
            if (!name.toLowerCase().includes(targetName.toLowerCase())) return;

            clearTimeout(timeout);
            await noble.stopScanningAsync().catch(() => {});

            try {
                await peripheral.connectAsync();
                const result = await readFromPeripheral(peripheral, name, peripheral.address);
                resolve(result);
            } catch {
                resolve(null);
            }
        });

        try {
            // Scan without UUID filter first — already-connected devices may not advertise 0x180F
            await noble.startScanningAsync([], false);
        } catch {
            clearTimeout(timeout);
            resolve(null);
        }
    });
}

async function readFromPeripheral(
    peripheral: Awaited<ReturnType<ReturnType<typeof withBindings>["connectAsync"]>>,
    deviceName: string,
    address: string
): Promise<BatteryResult | null> {
    try {
        const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
            ["180f"],
            ["2a19"]
        );

        if (characteristics.length === 0) {
            await peripheral.disconnectAsync().catch(() => {});
            return null;
        }

        const data = await characteristics[0].readAsync();
        const level = data.readUInt8(0);
        await peripheral.disconnectAsync().catch(() => {});

        return { level, deviceName, address };
    } catch {
        await peripheral.disconnectAsync().catch(() => {});
        return null;
    }
}
