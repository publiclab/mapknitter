# see http://ramblingsonrails.com/how-to-migrate-a-rails-app-from-attachment_fu-to-paperclip
require 'right_aws'

namespace :utils do
  namespace :attachments do
    task :initialize_s3 => :environment do
      s3_config = YAML.load_file(File.join(File.dirname(__FILE__), '/../../config/amazon_s3.yml'))
      s3_config = s3_config[Rails.env].to_options

      @s3 = RightAws::S3.new(s3_config[:access_key_id], s3_config[:secret_access_key])
    end

    desc "Make a copy of an S3 bucket"
    task :copy_s3_bucket => :initialize_s3 do
      from_bucket = @s3.bucket(ENV['FROM'])
      to_bucket = @s3.bucket(ENV['TO'], true)

      puts "Getting #{from_bucket.name} keys"
      keys = from_bucket.keys
      puts "keys retrieved: #{keys.size}"
      keys.each do |key|
        (1..10).each do |try|
          begin
            puts "Copying #{from_bucket.name}/#{key.name} to #{to_bucket.name}/#{key.name}"
            from_bucket.s3.interface.copy(from_bucket.name, key.name, to_bucket.name, key.name)
            break
          rescue Exception => e
            puts "problem, trying again..."
            sleep 1
          end
        end
      end
    end

    desc "Empty an S3 bucket by deleting all the contained files"
    task :empty_s3_bucket => :initialize_s3 do
      from_bucket = @s3.bucket(ENV['BUCKET'])

      puts "Emtptying #{from_bucket.name}"
      bucket.keys({'max-keys' => 100}).each do |key|
        (1..10).each do |try|
          begin
            print '.'
            STDOUT.flush
            key.delete
            break
          rescue Exception => e
            puts "\nproblem, trying again..."
            sleep 1
          end
        end
      end
    end

    desc "Delete an S3 bucket and all its contents"
    task :delete_s3_bucket => :empty_s3_bucket do
      from_bucket = @s3.bucket(ENV['BUCKET'])
      from_bucket.delete
    end

    desc "Migrate Attachement_fu to Paperclip"
    task :migrate_attachment_fu_to_paperclip => :initialize_s3 do
      #Set the Attachment_fu class you'll be migrating
      Klass = Warpable

      bucket = @s3.bucket(ENV['BUCKET'])

      #Move Attachment_fu files (keys) to new Paperclip names
      #Paperclip allows you to customise the naming schema of your
      #S3 keys (filenames) so you will need to handle that here manually
      #This scripts caters for the naming style :id/:style.:extension
      Klass.find(:all, :conditions => {:parent_id => nil}).each do |obj|
        parent_id = obj.id
        
        original_key_name = "#{Klass.name.downcase.pluralize}/#{parent_id}/#{obj.filename}"
        new_key_name = "paperclip/#{parent_id}/original#{File.extname(obj.filename).downcase}"

        # modified to copy not move
        #move_key bucket, original_key_name, new_key_name
        copy_key bucket, original_key_name, new_key_name

        #Get thumbnails
        if obj.thumbnailable?
          Klass.find_all_by_parent_id(obj.id).each do |child|
            original_key_name = "#{Klass.name.downcase.pluralize}/#{parent_id}/#{child.filename}"
            new_key_name = "paperclip/#{parent_id}/#{child.thumbnail}#{File.extname(child.filename).downcase}"

            #move_key bucket, original_key_name, new_key_name
            copy_key bucket, original_key_name, new_key_name
          end
        end
      end
    end

    def copy_key(bucket, original_key_name, new_key_name)
      puts "Copying #{bucket.name}/#{original_key_name} to #{bucket.name}/#{new_key_name}"
      #Occationally I am getting a 500 error from amazon so I'm putting these in a loop so that we can retry a couple of times if we need to
      (1..10).each do |try|
        begin
          original_key = RightAws::S3::Key.create(bucket, original_key_name)
          bucket.copy_key original_key_name, new_key_name if original_key.exists?
          break
        rescue Exception => e
          puts "problem, trying again..."
          sleep 1
        end
      end
    end

    def move_key(bucket, original_key_name, new_key_name)
      puts "Moving #{bucket.name}/#{original_key_name} to #{bucket.name}/#{new_key_name}"
      #Occationally I am getting a 500 error from amazon so I'm putting these in a loop so that we can retry a couple of times if we need to
      (1..10).each do |try|
        begin
          original_key = RightAws::S3::Key.create(bucket, original_key_name)
          bucket.move_key original_key_name, new_key_name if original_key.exists?
          break
        rescue Exception => e
          puts "problem, trying again..."
          sleep 1
        end
      end
    end
  end
end
