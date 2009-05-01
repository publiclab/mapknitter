# Page-caching would be so much better! would persist across reboots, too
# and would circumvent Rails entirely on cached pages
#
# This didn't work... read more here to figure it out?? http://ryanschenk.com/?p=43

# module ActionController
#   module Caching
#     module Actions
#       class ActionCachePath      
#         def initialize(controller, options = {})
#           puts "TESTING"
#           @extension = extract_extension(controller.request.path)
#           # path = controller.url_for(options).split('://').last
#           host = controller.url_for(options).split('://').last.split('/').first
#           path = host + controller.request.path + controller.request.query_string # Booya!
#           normalize!(path)
#           add_extension!(path, @extension)
#           @path = URI.unescape(path)
#         end
#       end
#     end
#   end
# end