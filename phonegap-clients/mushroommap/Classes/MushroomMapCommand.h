//
//  MushroomMapCommand.h
//  MushroomMap
//
//  Created by Michael Nachbaur on 13/04/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface MushroomMapCommand : NSObject {
    UIWebView*    webView;
    NSDictionary* settings;
}
@property (nonatomic, retain) UIWebView *webView;
@property (nonatomic, retain) NSDictionary *settings;

-(MushroomMapCommand*) initWithWebView:(UIWebView*)theWebView settings:(NSDictionary*)classSettings;
-(MushroomMapCommand*) initWithWebView:(UIWebView*)theWebView;
-(void) setWebView:(UIWebView*) theWebView;
-(void) setSettings:(NSDictionary*) classSettings;

@end
