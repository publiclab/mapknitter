class CommentsController < ApplicationController
    def index
    end

    def show
    end

    def new
    end

    def create
        if logged_in?
            map = Map.find params[:map_id]

            if params[:comment][:body] != ""
                map.comments.create(
                    :user_id => current_user.id,
                    :body => params[:comment][:body]
                )
            end
            redirect_to "/maps/" + params[:map_id]         
        else
            flash[:error] = "You must be logged in to comment."
            redirect_to "/login"
        end
    end

    def update
        @comment = Comment.find params[:id]

        if logged_in? && current_user.can_edit?(@comment)
            Comment.update(@comment.id, :body => params[:comment][:body])
            redirect_to "/maps/" + params[:map_id]
        else
            flash[:error] = "You must be logged in to comment."
            redirect_to "/login"            
        end
    end

    def edit
    end

    def destroy
        @comment = Comment.find(params[:id])

        if logged_in? && current_user.can_delete?(@comment)
            @comment.delete 
            flash[:notice] = "Comment by " + @comment.author + " deleted."
            redirect_to "show"
        else
            flash[:error] = "You must be logged in to delete comments."
            redirect_to "/login"
        end
    end
end