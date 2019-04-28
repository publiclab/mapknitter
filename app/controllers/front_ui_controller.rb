class FrontUiController < ApplicationController
  def index
  end

  def reverse_geocode
    respond_to do |format|
      format.html
      format.js
      format.json { render json: params  }
    end
  end

  def about
  end
end
