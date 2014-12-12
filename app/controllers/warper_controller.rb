require 'open-uri'
class WarperController < ApplicationController
  # avoid raising exceptions for common errors (e.g. file not found)
  #rescue_from Errno::ENOENT, :with => :url_upload_not_found
  #rescue_from Errno::ETIMEDOUT, :with => :url_upload_not_found
  #rescue_from OpenURI::HTTPError, :with => :url_upload_not_found
  #rescue_from Timeout::Error, :with => :url_upload_not_found
  protect_from_forgery :except => [:update,:delete]  

  def new
    @map_id = params[:id]
    render :layout => false
  end

  def create
    @map = Map.find params[:map_id]
    if @map.user_id != 0 && logged_in?# if it's not anonymous
      @warpable = Warpable.create(params[:warpable])
      @warpable.map_id = params[:map_id]
      map = Map.find(params[:map_id])
      map.updated_at = Time.now
      map.save
      if @warpable.save
        redirect_to :action => 'uploaded_confirmation',:id => @warpable.id
      else
puts @warpable.inspect
puts @warpable.save
        render :text => "There was an error."
      end
    else
      render :text => "You must be logged in to add images to this map"
    end
  end

  # cartagen.org/import/<map-name>/?url=http://myurl.com/image.jpg
  def import
    map = Map.find_by_name params[:name]
    @warpable = Warpable.new
    @warpable.map_id = map.id
    @warpable.url = params[:url]
    map.updated_at = Time.now
    map.save
    if @warpable.save 
      redirect_to "/maps/"+params[:name]
    else
      flash[:notice] = "Sorry, the image failed to import." 
      redirect_to "/map/edit/"+params[:name]
    end
  end

  def url_upload_not_found
    flash[:notice] = "Sorry, the URL you provided was not valid."
    redirect_to "/map/edit/"+params[:id]
  end

  def uploaded_confirmation
    @warpable = Warpable.find params[:id]
    render :layout => false
  end
  
  def show
    @image = Warpable.find params[:id]
  end
  
  def list
    @warpables = Warpable.find :all, :conditions => ['parent_id is NULL AND deleted = false']
  end
  
  def update
    @warpable = Warpable.find params[:warpable_id]
    
    nodes = []
    author = Map.find @warpable.map_id

    params[:points].split(':').each do |point|
      lon = point.split(',')[0].to_f
      lat = point.split(',')[1].to_f
      node = Node.new
      node.color = 'black'
      node.lat = lat
      node.lon = lon
      node.author = author
      node.name = ''
      node.save
    puts node.lon,node.lat
      nodes << node
    end

    node_ids = []
    nodes.each do |node|
      node_ids << node.id.to_s
    end
    puts params[:points]
    @warpable.nodes = node_ids.join(',')
    @warpable.locked = params[:locked]    
    @warpable.cm_per_pixel = @warpable.get_cm_per_pixel
    @warpable.save
    render :text => 'success'
  end
  
  def delete
    image = Warpable.find params[:id]
    image.deleted = true
    image.save
    render :text => 'successfully deleted '+params[:id]
  end
  
end
