class CommentsController < ApplicationController
  def create
    if logged_in?

      @comment = current_user.comments.new(comment_params)
      @map = @comment.map
      if @comment.save!
        users = @map.comments.collect(&:user).uniq
        users.each do |user|
          unless user.id == @map.user_id && user.id == current_user.id
            CommentMailer.notify(user, @comment).deliver_now
          end
        end
      end

      respond_to do |format|
        format.html { render partial: 'comments/comment', locals: { comment: @comment } }
        format.json { render json: @comment, status: :created }
      end

    else
      # we intercept this message in /app/assets/javascripts/maps.js
      render plain: 'Login required.'
    end
  end

  def update
    @comment = Comment.find params[:id]
    if logged_in? && current_user.can_edit?(@comment)
      @comment.update_attributes(comment_params)
      redirect_to  @comment.map
    else
      flash[:error] = 'You do not have permissions to update that comment.'
      redirect_to '/login'
    end
  end

  def destroy
    @comment = Comment.find(params[:id])

    if logged_in? && current_user.can_delete?(@comment)
      @comment.delete
      flash[:notice] = 'Comment deleted.'
    else
      flash[:error] = 'You do not have permission to delete that comment.'
    end
    redirect_to  @comment.map
  end

  private

  def comment_params
    params.require(:comment).permit(:body, :map_id, :user_id)
  end
end
