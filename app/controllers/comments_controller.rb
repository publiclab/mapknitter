class CommentsController < ApplicationController
    def index
    end

    def show
    end

    def new
    end

    def create
    end

    def update
    end

    def edit
    end

    def destroy
        @comment = Comment.find(params[:id])

        if logged_in? && current_user.can_delete_comment(@comment)
            @comment.delete 
            flash[:notice] = "Comment by " + @comment.author + " deleted."
            redirect_to "/maps/" + @comment.map.name
        else
            flash[:error] = "You must be logged in to delete tags."
            redirect_to "/login"
        end
    end
end