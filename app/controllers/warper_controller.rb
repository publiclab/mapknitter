class WarperController < ApplicationController

  protect_from_forgery :except => [:update,:delete]  

  def new
    @map_id = params[:id]
  end

  def create
    @warpable = Warpable.new(params[:warpable])
    @warpable.map_id = params[:map_id]
    if @warpable.save
      flash[:notice] = 'Warpable was successfully created.'
      redirect_to :action => 'uploaded_confirmation',:id => @warpable.id
    else
      flash[:notice] = 'There was an error'
      render :action => :new
    end
  end

  def uploaded_confirmation
    @warpable = Warpable.find params[:id]
  end
  
  def show
    @image = Warpable.find params[:id]
  end
  
  def list
    @warpables = Warpable.find :all, :conditions => ['parent_id is NULL']
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
    
    @warpable.save
    render :text => 'success'
  end
  
  def delete
    image = Warpable.find params[:id]
    image.delete
    render :text => 'successfully deleted '+params[:id]
  end
  
end
