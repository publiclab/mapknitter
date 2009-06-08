/*
 *  Contact.h
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import <Foundation/Foundation.h>
#import <AddressBook/ABAddressBook.h>
#import "MushroomMapCommand.h"

@interface Contacts : MushroomMapCommand {
	ABAddressBookRef addressBook;
	NSArray *allPeople;
	CFIndex nPeople;
}

@property (getter=getAddressBook,assign) ABAddressBookRef addressBook;
@property (getter=getContacts,assign) NSArray *allPeople;

-(MushroomMapCommand*) initWithWebView:(UIWebView*)theWebView;

- (void)get:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

- (void) displayContact:(ABRecordRef *) person;
- (void) addContact;

@end
