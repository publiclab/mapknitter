class TagController < ApplicationController

  def create
    if logged_in?
      map = nil
      params[:tag][:name].split(',').each do |name|
        tag = Tag.new({
          :name => name.strip,
          :map_id => params[:tag][:map_id],
          :user_id => current_user.id
        })
        tag.save
	map = tag.map
      end
      flash[:notice] = "Tag(s) added."
      redirect_to "/map/view/"+map.name
    else
      flash[:error] = "You must be logged in to add tags."
      redirect_to "/login"
    end
  end

  def show
    @tag = Tag.find_by_name(params[:id])
    @maps = Map.where('id IN (?)',Tag.where(name: params[:id]).collect(&:map_id).uniq).paginate(:page => params[:page], :per_page => 24)
    
    render :template => "map/search"
  end

  def delete
    @tag = Tag.find(params[:id])
    if logged_in? && (@tag.user_id == current_user.id || current_user.role == "admin")
      @tag.delete
      flash[:notice] = "Tag "+@tag.name+" deleted."
      redirect_to "/map/view/"+@tag.map.name
    else
      flash[:error] = "You must be logged in to delete tags."
      redirect_to "/login"
    end
  end

end
