/*
 *  Device.h
 *  Used to display Device centric details handset.
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 */

#import <UIKit/UIKit.h>
#import <UIKit/UIDevice.h>
#import "MushroomMapCommand.h"

@interface Device : MushroomMapCommand {
}

- (NSDictionary*) getDeviceProperties;

@end