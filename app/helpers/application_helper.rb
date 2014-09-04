# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper

	def admin
		APP_CONFIG["password"] == params[:password]
	end

	# polyfill for jquery-ujs in rails 2.x
	# see https://github.com/rails/jquery-ujs/wiki/Manual-installing-and-Rails-2
	def csrf_meta_tags
		if protect_against_forgery?
			out = %(<meta name="csrf-param" content="%s"/>\n)
			out << %(<meta name="csrf-token" content="%s"/>)
			out % [ Rack::Utils.escape_html(request_forgery_protection_token),
					Rack::Utils.escape_html(form_authenticity_token) ]
		end
 	end

end
