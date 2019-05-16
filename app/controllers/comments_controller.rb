class CommentsController < ApplicationController
  def create
    if logged_in?

      @comment = current_user.comments.new(comment_params)
      @map = Map.find comment_params[:map_id]
      if @comment.save!
        users = @map.comments.collect(&:user)
        users += [@map.user] unless @map.user.nil?
        users.uniq.each do |user|
          unless @map.user_id == current_user.id
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
      redirect_to "/maps/#{@comment.map.slug}"
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
    redirect_to "/maps/#{params[:map_id]}"
  end

  private

  def comment_params
    params.require(:comment).permit(:body, :map_id)
  end
end
