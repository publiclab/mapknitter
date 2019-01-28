xml.instruct!

xml.rss "version" => "2.0", "xmlns:dc" => "http://purl.org/dc/elements/1.1/" do
 xml.channel do

   xml.title       "Maps by "+params[:id]+" at MapKnitter.org"
   xml.link        url_for :only_path => false, :controller => 'spectrums'
   xml.description "Recently posted maps at MapKnitter.org, a Public Laboratory open source research initiative"

   @maps.each do |map|
     xml.item do
       xml.title       map.name
       xml.author      map.author
       xml.image       map.warpables.first.image.url(:small) if map.warpables.length > 0
       xml.pubDate     map.created_at.rfc822
       xml.category    "mapknitter"
       xml.link        "https://mapknitter.org/maps/"+map.slug
       xml.description "<iframe src='https://mapknitter.org/embed/"+map.slug+"' style='border:none;'></iframe><p>"+map.description.to_s+"</p><p>View map details: https://mapknitter.org/maps/"+map.slug+"</p>"
       xml.guid        "https://mapknitter.org/maps/"+map.slug
     end
   end

 end
end

