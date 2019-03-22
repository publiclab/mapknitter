require 'open-uri'
class ImagesController < ApplicationController
  # avoid raising exceptions for common errors (e.g. file not found)
  rescue_from Errno::ENOENT, :with => :url_upload_not_found
  rescue_from Errno::ETIMEDOUT, :with => :url_upload_not_found
  rescue_from OpenURI::HTTPError, :with => :url_upload_not_found
  rescue_from Timeout::Error, :with => :url_upload_not_found
  protect_from_forgery :except => [:update,:delete]  
  #Convert model to json without including root name. Eg. 'warpable'
  ActiveRecord::Base.include_root_in_json = false

  # proxy, used if MapKnitter is being backed by Amazon S3 file storage, 
  # to enable client-side distortion using webgl-distort, which requires same-origin
  def fetch
    if Rails.env.production?
      if params[:url][0..42] == "https://s3.amazonaws.com/grassrootsmapping/"
        url = URI.parse(params[:url])
        result = Net::HTTP.get_response(url)
        send_data result.body, :type => result.content_type, :disposition => 'inline'
      end
    else
      redirect_to params[:url]
    end
  end

  def create
    @warpable = Warpable.new
    @warpable.image = params[:uploaded_data]
    map = Map.find(params[:map_id])
    @warpable.history = ''
    @warpable.map_id = map.id
    map.updated_at = Time.now
    map.save
    respond_to do |format|     
      if @warpable.save
        format.html {
          render :json => [@warpable.fup_json].to_json,
          :content_type => 'text/html'
        }
       format.json { render :json => {:files => [@warpable.fup_json]}, :status => :created, :location => @warpable.image.url }
      else
       format.html { render :action => "new" }
       format.json { render :json => {:files => [@warpable.fup_error_json]}, :layout => false}
      end
    end
  end

  # mapknitter.org/import/<map-name>/?url=http://myurl.com/image.jpg
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

  # is this used?
  def url_upload_not_found
    flash[:notice] = "Sorry, the URL you provided was not valid."
    redirect_to "/map/edit/"+params[:id]
  end
  
  def show
    @image = Warpable.find params[:id]
    respond_to do |format|
      format.html # show.html.erb
      format.json { render :json => @image.map{|img| img.fup_json} }
    end
  end
  
  def update
    @warpable = Warpable.find params[:warpable_id]
    
    nodes = []
    author = @warpable.map.author

    # is it really necessary to make new points each time?
    params[:points].split(':').each do |point|
      lon = point.split(',')[0]
      lat = point.split(',')[1]
      node = Node.new({
                :color => 'black',
                :lat => lat,
                :lon => lon,
                :author => author,
                :name => ''
      })
      node.save
      nodes << node
    end

    @warpable.nodes = nodes.collect(&:id).join(',')
    @warpable.locked = params[:locked]    
    @warpable.cm_per_pixel = @warpable.get_cm_per_pixel
    @warpable.save
    render :text => 'success'
  end

  def destroy
    @warpable = Warpable.find params[:id]
    if logged_in? && current_user.can_delete?(@warpable)
      @warpable.destroy
      respond_to do |format|
        format.html { redirect_to @warpable.map } 
        format.json { render :json => @warpable }
      end
    else
      flash[:error] = "You must be logged in to delete images."
      redirect_to "/login"
    end
  end
  
end
