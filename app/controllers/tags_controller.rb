class TagsController < ApplicationController
  before_filter :require_login, only: %i[edit update destroy]

  def create
    @map = Map.find params[:map_id]

    if logged_in?
      save_tags(@map)
      redirect_to '/maps/' + @map.slug
    else
      flash[:error] = 'You must be logged in to add tags'
      redirect_to '/login?back_to=/maps/' + @map.slug
    end
  end

  def show
    @tag = Tag.find_by_name params[:id]
    @maps = @tag.maps.paginate(page: params[:page], per_page: 24)
    @title = "Maps tagged with '" + @tag.name + "'"
    render template: 'maps/index'
  end

  def destroy
    @tag = Tag.find(params[:id])

    if logged_in? && current_user.can_delete?(@tag)
      @tag.delete
      flash[:notice] = 'Tag ' + @tag.name + ' deleted.'
      redirect_to @tag.map
    else
      flash[:error] = 'You must be logged in to delete tags.'
      redirect_to '/login'
    end
  end

  private

  def tag_params
    params.require(:tag).permit(:name)
  end
end
