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
       xml.pubDate     map.created_at.rfc822
       xml.category    "mapknitter"
       xml.image       map.warpables.first.image.url(:medium)
       xml.link        "https://mapknitter.org/maps/" + map.slug
       spamlink = (params[:moderators] == 'true') ? " Looks like spam? <a href='https://mapknitter.org/maps/archive/#{map.slug}'>Archive/Spam this map</a>" : ""
       xml.description map.description.to_s + " " + map.warpables.first.image.url(:medium) + spamlink
       xml.guid        "https://mapknitter.org/maps/"+map.slug
     end
   end

 end
end

