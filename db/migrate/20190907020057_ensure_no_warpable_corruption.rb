require_relative '20111005211631_add_zip_warpable_res_history'

class EnsureNoWarpableCorruption < ActiveRecord::Migration[5.2]
  def self.up
    AddZipWarpableResHistory.down
    AddZipWarpableResHistory.up

    msg = 'MySQL 5.7 began throwing errors on migrations that set a default for columns of type text.' + 
          'We edited that migration and rerun it here to ensure no data corruption in production'
    
    change_table_comment(:warpables, msg)
  end

  def self.down
    raise ActiveRecord::IrreversibleMigration
  end
end
