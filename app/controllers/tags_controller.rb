class TagsController < ApplicationController

  before_filter :require_login, :only => [:edit, :update, :destroy]

  def create
    @map = Map.find params[:map_id]

    if logged_in?
      # there is identical code in MapsController#update.
      # TODO: DRY up this functionality.
 
      # save new tags
      if params[:tags]
        params[:tags].gsub(' ', ',').split(',').each do |tagname|
          @map.add_tag(tagname.strip, current_user)
        end
      end
 
      redirect_to "/maps/" + @map.slug
    else
      redirect_to "/login?back_to=/maps/" + @map.slug
    end
  end

  def show
    @tag = Tag.find_by_name params[:id]
    @maps = @tag.maps.paginate(:page => params[:page], :per_page => 24)
    @title = "Maps tagged with '"+@tag.name+"'"
    render :template => 'maps/index'
  end

  def destroy
    @tag = Tag.find(params[:id])

    if logged_in? && (@tag.user_id.to_i == current_user.id || current_user.role == "admin")
      @tag.delete
      flash[:notice] = "Tag " + @tag.name + " deleted."
      redirect_to @tag.map
    else
      flash[:error] = "You must be logged in to delete tags."
      redirect_to "/login"
    end
  end

end
