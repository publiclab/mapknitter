require 'open3'

class Gdal

  def self.ulimit
    # use ulimit to restrict to 7200 CPU seconds and 5gb virtual memory, and 2gB file storage:
    "ulimit -t 7200 && ulimit -v 5000000 && ulimit -f 2000000 && "
  end
 
  def self.raw(cmd,verbose)
    stdin, stdout, stderr = Open3.popen3(self.ulimit+cmd)
    if verbose
	puts stderr.readlines
	puts stdout.readlines
    end
  end

#  def self.gdal_merge(args)
#    self.raw()
#  end

end
