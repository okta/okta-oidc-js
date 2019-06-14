//#import "OktaSdkBridge.h"
//
//@implementation OktaSdkBridge
//
//RCT_EXPORT_MODULE()
//
//RCT_EXPORT_METHOD(sampleMethod:(NSString *)stringArgument numberParameter:(nonnull NSNumber *)numberArgument callback:(RCTResponseSenderBlock)callback)
//{
//    // TODO: Implement some real useful functionality
//    callback(@[[NSString stringWithFormat: @"numberArgument: %@ stringArgument: %@", numberArgument, stringArgument]]);
//}
//
//@end

#import "OktaSdkBridge-Bridging-Header.h"

@interface RCT_EXTERN_MODULE(OktaSdkBridge, NSObject)

RCT_EXTERN_METHOD(printMessage:(NSString *)message)

@end

