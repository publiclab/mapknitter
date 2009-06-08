#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
#import <UIKit/UINavigationController.h>
#import <JSON/JSON.h>

#import "Location.h"
#import "Device.h"
#import "Sound.h"
#import "Contacts.h"
#import "DebugConsole.h"
#import "UIControls.h"
//#import "Image.h"

@class MushroomMapViewController;
@class Sound;
@class Contacts;
@class Console;
//@class Image;

@interface MushroomMapDelegate : NSObject <
    UIApplicationDelegate, 
    UIWebViewDelegate, 
    UIAccelerometerDelegate,
    UINavigationControllerDelegate
  >
{
	
	IBOutlet UIWindow *window;
	IBOutlet UIWebView *webView;
	IBOutlet MushroomMapViewController *viewController;
	
	IBOutlet UIImageView *imageView;
	IBOutlet UIActivityIndicatorView *activityView;

	NSURLConnection *conn;				// added by urbian
	NSMutableData *receivedData;		// added by urbian	

    UIInterfaceOrientation orientationType;
    NSDictionary *settings;
    NSMutableDictionary *commandObjects;
}

@property (nonatomic, retain) UIWindow *window;
@property (nonatomic, retain) MushroomMapViewController *viewController;
@property (nonatomic, retain) UIActivityIndicatorView *activityView;
@property (nonatomic, retain) NSMutableDictionary *commandObjects;
@property (nonatomic, retain) NSDictionary *settings;

-(id) getCommandInstance:(NSString*)className;
+ (NSDictionary*)getBundlePlist:(NSString *)plistName;

@end
