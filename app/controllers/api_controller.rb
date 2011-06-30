class ApiController < ApplicationController

  def index
    redirect_to "/api/index.html"
  end

  def planet
#    url = URI.parse('http://cartagen.org/api/0.6/geohash/'+params[:id]+'.json')
#    req = Net::HTTP::Get.new(url.path)
#    res = Net::HTTP.start(url.host, url.port) {|http|
#      http.request(req)
#    }
#    render :text => res.body
  end

end
