
Pod::Spec.new do |s|
  s.name         = "OktaSdkBridge"
  s.version      = "1.0.0"
  s.summary      = "ROktaSdkBridgeNNewlibrary"
  s.description  = <<-DESC
                  RNNewlibrary
                   DESC
  s.homepage     = ""
  s.license      = "MIT"
  # s.license      = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author             = { "author" => "author@domain.cn" }
  s.platform     = :ios, "9.0"
  s.source       = { :git => "https://github.com/author/OktaSdkBridge.git", :tag => "master" }
  s.source_files  = "**/*.{h,m,swift}"
  s.requires_arc = true


  s.dependency "React"
  s.dependency "OktaOidc"

end