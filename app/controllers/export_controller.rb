class ExportController < ApplicationController
  protect_from_forgery except: :formats

  def index
    @exports = Export.where('status NOT IN (?)', %w(failed complete none))
                     .order('updated_at DESC')
    @day = Export.where(status: 'complete')
                 .where('updated_at > (?)', (Time.now - 1.day).to_s(:db))
                 .count
    @week = Export.where(status: 'complete')
                  .where('updated_at > (?)', (Time.now - 1.week).to_s(:db))
                  .count
  end

  # override logger to suppress huge amounts of inane /export/progress logging
  def logger
    if params[:action] == 'progress'
      nil
    else
      Rails.logger
    end
  end

  # https://mapknitter.org/warps/yale-farm/yale-farm.jpg
  def jpg
    send_file 'public/warps/' + params[:id] + '/' + params[:id] + '.jpg'
  end

  # https://mapknitter.org/warps/yale-farm/yale-farm-geo.tif
  def geotiff
    send_file 'public/warps/' + params[:id] + '/' + params[:id] + '-geo.tif'
  end

  def cancel
    @map = Map.find_by(id: params[:id])
    if @map.anonymous? || logged_in?
      export = @map.export
      export.status = 'none'
      export.save
      if params[:exports]
        flash[:notice] = 'Export cancelled.'
        redirect_to '/exports'
      else
        render plain: 'cancelled'
      end
    else
      render plain: 'You must be logged in to export, unless the map is anonymous.'
    end
  end

  def progress
    map = Map.find_by(id: params[:id])
    export = map.export
    output = if export.present?
               if export.status == 'complete'
                 'complete'
               elsif export.status == 'none'
                 'export not running'
               elsif export.status == 'failed'
                 'export failed'
               else
                 export.status
                        end
             else
               'export has not been run'
             end
    render plain: output, layout: false
  end

  def status
    map = Map.find_by(id: params[:id])
    if export = map.export
      if export.export_url.present?
        status_response = ExporterClient.new(export.export_url).status
        render json: status_response
      else
        render json: export.to_json
      end
    else
      render json: { status: 'export has not been run' }
    end
  end

  def create
    # Saving in export_url column because assuming that is not being used in new Export API
    # if it is, instead create a new col like 'status_url' and save the url there

    # mySQL2 error ActiveRecord::StatementInvalid (Mysql2::Error: Field 'bands_string' doesn't have a default value: INSERT INTO `exports` (`export_url`, `created_at`, `updated_at`) VALUES ('//export.mapknitter.org/id/1562102960/status.json', '2019-07-02 21:29:20', '2019-07-02 21:29:20')):
    # so adding a default value for now. I think this column will be deprecated?
    export = Export.create!(
      export_url: params[:status_url],
      user_id: current_user&.id || 0,
      map_id: params[:map_id],
      bands_string: 'default bands_string'
    )
    render json: export.to_json
  end

  # for demoing remote url functionality during testing
  def external_url_test
    render json: Export.last.to_json
  end

  private

  def export_params
    params.require(:export).permit(:status, :export_url)
  end
end
