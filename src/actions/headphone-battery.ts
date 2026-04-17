import { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent, streamDeck } from "@elgato/streamdeck";
import { readBatteryLevel } from "../battery";
import { renderBatteryImage, svgToDataUrl } from "../render";

const POLL_INTERVAL_MS = 30_000;

type HeadphoneBatterySettings = {
    deviceName?: string;
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
        const targetName = ev.payload.settings.deviceName ?? "AirPods Max";
        try {
            const result = await readBatteryLevel(targetName);
            const state = typeof result === "object" ? result.level : result;
            await ev.action.setImage(svgToDataUrl(renderBatteryImage(state)));
            if (result === "permission_denied") {
                streamDeck.logger.warn(
                    "Bluetooth permission denied. Grant access to Stream Deck in " +
                    "System Settings → Privacy & Security → Bluetooth, then press the key to refresh."
                );
            }
        } catch (err) {
            streamDeck.logger.error("Battery update failed:", err);
            await ev.action.setImage(svgToDataUrl(renderBatteryImage("not_found")));
        }
    }
}
