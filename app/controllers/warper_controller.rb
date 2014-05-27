require 'open-uri'
class WarperController < ApplicationController
  # avoid raising exceptions for common errors (e.g. file not found)
  rescue_from Errno::ENOENT, :with => :url_upload_not_found
  rescue_from Errno::ETIMEDOUT, :with => :url_upload_not_found
  rescue_from OpenURI::HTTPError, :with => :url_upload_not_found
  rescue_from Timeout::Error, :with => :url_upload_not_found
  protect_from_forgery :except => [:update,:delete]  
  #Convert model to json without including root name. Eg. 'warpable'
  ActiveRecord::Base.include_root_in_json = false

  #Unecessary
  #def index
  #  @warpable = Warpable

  #  respond_to do |format|
  #    format.json { render :json => @warpable.map{|w| w.fup_json } }
  #  end
  #end

  def new
    @map_id = params[:id]
    @warpable = Warpable.new
    respond_to do |format|
     format.html { render :layout => false } 
     format.json { render :json => @warpable}
    end

  end

  def create
    @warpable = Warpable.new(params[:warpable])
    @warpable.map_id = params[:map_id]
    map = Map.find(params[:map_id])
    map.updated_at = Time.now
    map.save
    respond_to do |format|     
      if @warpable.save
       format.html { redirect_to :action => 'uploaded_confirmation',:id => @warpable.id }
       format.json { format.json { render :json => {:files => [@warpable.fup_json]}, :status => :created, :location => @warpable }}
      else
       format.html { render :action => "new" }
       format.json { render :json => @upload.errors, :status => :unprocessable_entity }
      end
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
    respond_to do |format|
      format.html # show.html.erb
      format.json { render :json => @image.to_json }
    end
  end
  
  def list
    @warpables = Warpable.find :all, :conditions => ['parent_id is NULL AND deleted = false']
  end
  
  def update
    @warpable = Warpable.find params[:warpable_id]
    
    nodes = []
    author = Map.find @warpable.map_id

    params[:points].split(':').each do |point|
      lon = point.split(',')[0], lat = point.split(',')[1]
	node = Node.new({:color => 'black',
                :lat => lat,
                :lon => lon,
                :author => author,
                :name => ''
      })
      node.save
      nodes << node
    end

    node_ids = []
    nodes.each do |node|
      node_ids << node.id
    end
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
    respond_to do |format|
      format.html { render :text => 'successfully deleted '+params[:id]}
      format.json { head :no_content }
    end
  end
  
end
