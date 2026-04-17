#import <Foundation/Foundation.h>
#import <IOBluetooth/IOBluetooth.h>
#import <objc/message.h>

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        NSString *targetName = argc > 1
            ? [NSString stringWithUTF8String:argv[1]]
            : @"AirPods Max";

        NSArray *devices = [IOBluetoothDevice pairedDevices];
        for (IOBluetoothDevice *device in devices) {
            NSString *name = device.nameOrAddress;
            if (!name || ![device isConnected]) continue;
            if (![name localizedCaseInsensitiveContainsString:targetName]) continue;

            // Call private batteryPercentCombined - returns 0-100 or 0 if unavailable
            typedef int (*intGetter)(id, SEL);
            intGetter getter = (intGetter)objc_msgSend;

            SEL combinedSel  = NSSelectorFromString(@"batteryPercentCombined");
            SEL singleSel    = NSSelectorFromString(@"batteryPercentSingle");
            SEL headsetSel   = NSSelectorFromString(@"headsetBattery");

            int level = -1;
            if ([device respondsToSelector:combinedSel]) {
                level = getter(device, combinedSel);
            }
            if (level <= 0 && [device respondsToSelector:singleSel]) {
                level = getter(device, singleSel);
            }
            if (level <= 0 && [device respondsToSelector:headsetSel]) {
                level = getter(device, headsetSel);
            }

            if (level > 0) {
                printf("%d\n", level);
            } else {
                printf("-1\n");
            }
            return 0;
        }
        // Not found
        printf("-1\n");
        return 0;
    }
}
