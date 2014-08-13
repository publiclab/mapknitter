class TagsController < ApplicationController

    def index
    end

    def new
    end

    def create
    end

    def show
    end

    def edit
    end

    def update
    end

    def destroy(map_id, tag_id)
        @tag = Tag.find(params[:id])
        if logged_in? && (@tag.user_id == current_user.id || current_user.role == "admin")
              @tag.delete
              flash[:notice] = "Tag " + @tag.name + " deleted."
              redirect_to "/maps/" + @tag.map.name
        else
              flash[:error] = "You must be logged in to delete tags."
              redirect_to "/login"
        end
    end

end