OpenIdAuthentication.store = :file

# Pickaxe-through-window solution: 
Rack::OpenID.class_eval do

      def realm_url(req)
        url = req.scheme + "://"
        url << req.host

        scheme, port = req.scheme, req.port
        if scheme == "https" && port != 443 ||
            scheme == "http" && port != 80
          #url << ":#{port}"
        end

        url
      end

end

# gotta break the return_to port mismatch check too...
# #<OpenID::Consumer::FailureResponse:0x7f29a34f0b68 @endpoint=#<OpenID::OpenIDServiceEndpoint:0x7f29a34e76d0 @display_identifier=nil, @type_uris=["http://specs.openid.net/auth/2.0/server"], @used_yadis=true, @server_url="http://publiclaboratory.org/openid/provider", @canonical_id=nil, @claimed_id=nil, @local_id=nil>, @message="return_to port does not match", @reference=nil, @contact=nil>

require "openid/message"
require "openid/protocolerror"
require "openid/kvpost"
require "openid/consumer/discovery"
require "openid/urinorm"

OpenID::Consumer::IdResHandler.class_eval do

      def verify_return_to_base(msg_return_to)
        begin
          app_parsed = URI.parse(OpenID::URINorm::urinorm(@current_url))
        rescue URI::InvalidURIError
          raise OpenID::ProtocolError, "current_url is not a valid URI: #{@current_url}"
        end

        [:scheme, :host, :port, :path].each do |meth|
        #[:scheme, :host, :path].each do |meth|
          if msg_return_to.send(meth) != app_parsed.send(meth)
            raise OpenID::ProtocolError, "return_to #{meth.to_s} does not match"
          end
        end
      end

end

