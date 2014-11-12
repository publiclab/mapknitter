class TagsController < ApplicationController

    def index
    end

    def new
    end

    def create
        # there is identical code in MapsController#update.
        # TODO: DRY up this functionality.

        @map = Map.find params[:map_id]

        # save new tags
        if params[:tags]
          params[:tags].gsub(' ', ',').split(',').each do |tagname|
            @map.add_tag(tagname.strip, current_user)
          end
        end

        redirect_to "/maps/" + params[:map_id]
    end

    def show
    end

    def edit
    end

    def update
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