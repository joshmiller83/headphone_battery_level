#import <Foundation/Foundation.h>
#import <IOBluetooth/IOBluetooth.h>
#import <objc/message.h>

/*
 * Reads battery level from a connected Bluetooth headphone via the private
 * IOBluetoothDevice battery APIs (batteryPercentCombined / batteryPercentSingle).
 *
 * Exit codes:
 *   0  – success, battery level printed to stdout (1-100)
 *   1  – device not found or not connected
 *   2  – Bluetooth permission denied (grant permission to the parent app in
 *          System Settings → Privacy & Security → Bluetooth)
 */
int main(int argc, const char *argv[]) {
    @autoreleasepool {
        NSString *targetName = argc > 1
            ? [NSString stringWithUTF8String:argv[1]]
            : @"AirPods Max";

        NSArray *devices = nil;
        @try {
            devices = [IOBluetoothDevice pairedDevices];
        } @catch (NSException *ex) {
            // IOBluetooth raises when the responsible process lacks Bluetooth TCC permission.
            // Grant Bluetooth access to the parent app in:
            //   System Settings → Privacy & Security → Bluetooth
            fprintf(stderr, "Bluetooth permission denied: %s\n", [[ex reason] UTF8String]);
            return 2;
        }

        for (IOBluetoothDevice *device in devices) {
            NSString *name = device.nameOrAddress;
            if (!name || ![device isConnected]) continue;
            if (![name localizedCaseInsensitiveContainsString:targetName]) continue;

            typedef int (*intGetter)(id, SEL);
            intGetter getter = (intGetter)objc_msgSend;

            SEL combinedSel = NSSelectorFromString(@"batteryPercentCombined");
            SEL singleSel   = NSSelectorFromString(@"batteryPercentSingle");
            SEL headsetSel  = NSSelectorFromString(@"headsetBattery");

            int level = -1;
            if ([device respondsToSelector:combinedSel]) level = getter(device, combinedSel);
            if (level <= 0 && [device respondsToSelector:singleSel]) level = getter(device, singleSel);
            if (level <= 0 && [device respondsToSelector:headsetSel]) level = getter(device, headsetSel);

            if (level > 0) {
                printf("%d\n", level);
                return 0;
            }
        }

        return 1;
    }
}
