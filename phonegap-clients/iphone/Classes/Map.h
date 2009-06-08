//
//  Map.h
//  MushroomMap
//
//  Created by Brant Vasilieff on 3/4/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "MushroomMapCommand.h"

@interface Map : MushroomMapCommand {
}

- (void)open:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end
