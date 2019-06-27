
Pod::Spec.new do |s|
  s.name         = "OktaSdkBridge"
  s.version      = "1.0.0"
  s.summary      = "RNOktaSdkBridgeLibrary"
  s.description  = <<-DESC
                  RNOktaSdkBridgeLibrary
                   DESC
  s.homepage     = "https://github.com/okta/okta-oidc-js"
  s.license      = "Apache"
  s.license      = { :type => "Apache", :file => "../LICENSE" }
  s.platform     = :ios, "11.0"
  s.source       = { :git => "https://github.com/okta/okta-oidc-js.git", :tag => "master" }
  s.source_files  = "**/*.{h,m,swift}"
  s.requires_arc = true


  s.dependency "React"
  s.dependency "OktaOidc"

end