//
//  MushroomMapCommand.m
//  MushroomMap
//
//  Created by Michael Nachbaur on 13/04/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import "MushroomMapCommand.h"

@implementation MushroomMapCommand
@synthesize webView;
@synthesize settings;

-(MushroomMapCommand*) initWithWebView:(UIWebView*)theWebView settings:(NSDictionary*)classSettings
{
    self = [self initWithWebView:theWebView];
    if (self)
        [self setSettings:classSettings];
    return self;
}

-(MushroomMapCommand*) initWithWebView:(UIWebView*)theWebView
{
    self = [super init];
    if (self)
        [self setWebView:theWebView];
    return self;
}

-(void) setWebView:(UIWebView*) theWebView
{
    webView = theWebView;
}

-(void) setSettings:(NSDictionary*) classSettings
{
    settings = classSettings;
}

- (void)dealloc
{
    if (self.settings)
        [self.settings release];
    [super dealloc];
}

@end
