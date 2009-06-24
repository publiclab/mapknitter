gem "httparty"
require "httparty"

class ParseGeoRss
  include HTTParty
  format :xml

  def self.parse(url)
    geo_rss = self.get(url)
    nodes = []
    geo_rss['rss']['channel']['item'].each do |node|
      nodes.push(
        'name' => node['title'],
        'description' => node['description'],
        'timestamp' => node['dc:date.Taken'],
        'lat' => node['geo:lat'],
        'lon' => node['geo:long'],
        'img' => node['media:content']['url'],
        'author' => node['media:credit'],
        'id' => Time.parse(node['dc:date.Taken']).to_i.to_s + rand(1000000).to_s,
        'display' => true
      )
    end

    return {
      'osm' => {
        'node' => nodes
      }
    }

  end
end
