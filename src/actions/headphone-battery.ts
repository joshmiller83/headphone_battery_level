import { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent, streamDeck } from "@elgato/streamdeck";
import { readBatteryLevel } from "../battery";
import { renderBatteryImage, svgToDataUrl } from "../render";

const POLL_INTERVAL_MS = 30_000;

type HeadphoneBatterySettings = {
    deviceName?: string;
    cachedAddress?: string;
};

@action({ UUID: "com.joshmiller83.headphone-battery-level.battery" })
export class HeadphoneBattery extends SingletonAction<HeadphoneBatterySettings> {
    private _intervalId?: ReturnType<typeof setInterval>;

    override async onWillAppear(ev: WillAppearEvent<HeadphoneBatterySettings>): Promise<void> {
        await this._update(ev);
        this._intervalId = setInterval(() => this._update(ev), POLL_INTERVAL_MS);
    }

    override onWillDisappear(_ev: WillDisappearEvent<HeadphoneBatterySettings>): void {
        if (this._intervalId !== undefined) {
            clearInterval(this._intervalId);
            this._intervalId = undefined;
        }
    }

    override async onKeyDown(ev: KeyDownEvent<HeadphoneBatterySettings>): Promise<void> {
        await this._update(ev);
    }

    private async _update(
        ev: WillAppearEvent<HeadphoneBatterySettings> | KeyDownEvent<HeadphoneBatterySettings>
    ): Promise<void> {
        const { settings } = ev.payload;
        const targetName = settings.deviceName ?? "AirPods Max";

        try {
            const result = await readBatteryLevel(targetName, settings.cachedAddress);

            // Cache address so subsequent polls skip BLE scan
            if (result && result.address !== settings.cachedAddress) {
                await ev.action.setSettings({ ...settings, cachedAddress: result.address });
            }

            await ev.action.setImage(svgToDataUrl(renderBatteryImage(result?.level ?? null)));
        } catch (err) {
            streamDeck.logger.error("Battery update failed:", err);
            await ev.action.setImage(svgToDataUrl(renderBatteryImage(null)));
        }
    }
}
