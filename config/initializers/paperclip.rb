require "paperclip/railtie"
Paperclip::Railtie.insert

if Rails.env.production?
  Paperclip::Attachment.default_options[:storage] = :s3
  Paperclip::Attachment.default_options[:path] = "warpables/:id/:custom_filename.:extension"
  Paperclip::Attachment.default_options[:s3_credentials] = "config/amazon_s3.yml"
else
  Paperclip::Attachment.default_options[:storage] = :filesystem
  Paperclip::Attachment.default_options[:path] = ":rails_root/public/system/:attachment/:id/:style/:filename"
  Paperclip::Attachment.default_options[:url] = "/system/:attachment/:id/:style/:filename"
end
