xml.instruct!

xml.rss "version" => "2.0", "xmlns:dc" => "http://purl.org/dc/elements/1.1/" do
 xml.channel do

   xml.title       "Recent maps at MapKnitter.org"
   xml.link        url_for :only_path => false, :controller => 'spectrums'
   xml.description "Recently posted maps at MapKnitter.org, a Public Lab open source research initiative"

   @maps.each do |map|
     xml.item do
       xml.title       map.name
       xml.author      map.author
       xml.pubDate     map.created_at.to_s(:rfc822)
       xml.category    "mapknitter"
       xml.link        "https://mapknitter.org/maps/"+map.slug
       xml.description map.description.to_s
       xml.guid        "https://mapknitter.org/maps/"+map.slug
     end
   end

 end
end

