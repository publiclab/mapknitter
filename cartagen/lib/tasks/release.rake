require 'fileutils'

desc "Builds a release"
task :release do
	templates = Dir['release/templates/[^.]*'].collect{|t| t.split('/').last}
	tmpl = ''
	until templates.member? tmpl
		puts "Select a release template. Options: " + templates.join(', ')
		print '> '
		tmpl = $stdin.gets.strip
	end

	puts 'Enter a version for this release'
	print '> '
	version = $stdin.gets.strip


	FileUtils.rm_r 'release/.temp' if Dir['release/.*'].member? 'release/.temp'
	Dir.mkdir 'release/.temp'
	Dir.mkdir 'release/.temp/cartagen'
	FileUtils.cp_r Dir["release/templates/#{tmpl}/**"], 'release/.temp/cartagen'

	working_dir = "release/.temp/cartagen"
	Dir.mkdir("#{working_dir}/cartagen")
	FileUtils.cp_r %w(public/cartagen/src public/cartagen/cartagen.js public/cartagen/lib), "#{working_dir}/cartagen"
	FileUtils.cp_r Dir["release/notes/#{tmpl}/#{version}"], working_dir
	FileUtils.cp 'public/cartagen/style.css', working_dir
	FileUtils.rm_r "#{working_dir}/cartagen/lib/jsdoc"
	FileUtils.rm_r "#{working_dir}/cartagen/lib/sprockets"
	FileUtils.rm "#{working_dir}/cartagen/lib/filesystemwatcher.rb"
	FileUtils.rm "#{working_dir}/cartagen/lib/servicestate.rb"
	FileUtils.rm_r Dir["#{working_dir}/**/.svn"]

	date_string = Time.now.strftime '%m/%d/%y'
	readme = IO.read "#{working_dir}/README.txt"
	readme.gsub! '!!VERSION!!', version
	readme.gsub! '!!DATE!!', date_string
	File.open("#{working_dir}/README.txt", 'w') {|f| f.print readme}

	FileUtils.cd 'release/.temp'
	`zip -r ../out/cartagen-#{tmpl}-#{version}.zip cartagen`
	FileUtils.cd '../..'
	FileUtils.rm_r 'release/.temp'
end