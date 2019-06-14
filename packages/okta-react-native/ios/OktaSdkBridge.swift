//
//  OktaSdkBridge.swift
//  OktaSdkBridge
//
//  Created by Kayci Wang on 6/14/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation

@objc(OktaSdkBridge)
class OktaSdkBridge: NSObject {
    
    @objc func sampleMethod(promiseResolver: RCTPromiseResolveBlock, promiseRejecter: RCTPromiseRejectBlock) {
        promiseResolver("This is a test method, and it has been resolved")
    }
    
}
