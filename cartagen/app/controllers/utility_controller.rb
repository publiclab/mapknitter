class UtilityController < ApplicationController

  def proxy
    url = URI.parse(params[:url])
    req = Net::HTTP::Get.new(url.path)
    res = Net::HTTP.start(url.host, url.port) {|http|
      http.request(req)
    }
    render :text => res.body
  end

end
