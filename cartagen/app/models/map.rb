class Map < ActiveRecord::Base
  validates_presence_of :name

  def validate
    self.name != 'untitled'
  end
  
  def after_create
    puts 'saving Map'
    if last = Map.find_by_name(self.name,:order => "version DESC")
      self.version = last.version + 1
    end
  end

end
