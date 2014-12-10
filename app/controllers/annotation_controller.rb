class AnnotationController < ApplicationController

  def embed
    @map = Map.find_by_name params[:id]
    render :layout => false
  end

  def create
    map = Map.find(params[:map_id]) if params[:map_id]
    if logged_in? || (map && map.anon_annotatable)
      @note = Node.new(
        :body => params[:description],
        :lat => params[:lat],
        :lon => params[:lon],
        :map_id => params[:map_id]
        )
      @note.author = current_user.login if logged_in?
        # anonyous annotations
        # be sure the annnotation is nearby the map... by .1 lat/lon
        @note.author = map.author if !logged_in? && map && map.anon_annotatable
      @note.save!
      render :text => @note.id
    else
      flash[:error] = "You can't do that unless you're logged in."
      redirect_to "/home"
    end
  end

  def delete
    @note = Node.find params[:id]
    if logged_in? && (current_user.login == @note.author || current_user.role == "admin") || -(@note.created_at - DateTime.now) < (60*10) # or younger than 10 mins
      @note.delete
      flash[:notice] = "Annotation deleted."
      redirect_to params[:back]
    else
      flash[:error] = "You can't do that unless you're logged in."
      redirect_to "/"
    end
  end

  def delete_poly
    @poly = Way.find params[:id]
    if logged_in? && (current_user.login == @poly.author || current_user.role == "admin") || -(@poly.created_at - DateTime.now) < (60*10) # or younger than 10 mins
      @nodes = Node.find_all_by_way_id @poly.id
      @nodes.each do |n|
        n.delete
      end
      @poly.destroy
      flash[:notice] = "Annotation deleted."
      redirect_to params[:back]
    else
      flash[:error] = "You can't do that unless you're logged in."
      redirect_to "/home"
    end
  end

  def index
    @notes = Node.find :all, :order => "id DESC", :conditions => ['map_id != 0 AND way_id = 0']
    @notes = @notes.paginate :page => params[:page], :per_page => 24
  end

  # POST
  # /annotation/create_poly?description=<description>&color=<color>&nodes=[{"lat":<lat>,"lon":<lon>}]
  def create_poly
    map = Map.find(params[:map_id]) if params[:map_id]
    if logged_in? || (map && map.anon_annotatable)
      params[:color] ||= "red"
      @poly = Way.new(
        :body => params[:description],
        :color => params[:color],
        :map_id => params[:map_id]
        )
      @poly.author = current_user.login if logged_in?
      # anonyous annotations
      # be sure the annnotation is nearby the map... by .1 lat/lon
      @poly.author = map.author if !logged_in? && map && map.anon_annotatable
      @poly.save!
      @nodes = params[:nodes]
      @nodes.keys.each do |key|
        node = @nodes[key]
        note = Node.new(
          :lat => node[0].to_f,
          :lon => node[1].to_f,
          :way_order => node[2].to_i,
          :way_id => @poly.id,
          :map_id => params[:map_id].to_i
        )
        note.author = current_user.login if logged_in?
        # anonyous annotations
        # be sure the annnotation is nearby the map... by .1 lat/lon
        note.author = map.author if !logged_in? && map && map.anon_annotatable
        note.save!
        puts note
        puts note.inspect
      end
      render :text => @poly.id
    else
      flash[:error] = "You can't do that unless you're logged in."
      redirect_to "/home"
    end
  end

end
