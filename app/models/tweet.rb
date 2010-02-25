class Tweet < ActiveResource::Base
  
  self.site = "http://twitter.com"
  self.user = "whooz"
  self.password = "gibbledygobbledygoo"
                                                                                                                              self.password = "poopies"
  # Get the latest 20 public statuses
  # Optionally take in :since_id and get updates since passed id
  # Can't figure out how to get a :from and a :params
  def self.public_timeline(params={})
    find(:all, :from=>:public_timeline)
  end

  # Get 20 most recent statuses from authenticated user and his/her friends in the last 24 hours
  # Optionally take in :since timestamp in format: Tue%2C+27+Mar+2007+22%3A55%3A48+GMT
  # Can't figure out how to get a :from and a :params
  def self.friends_timeline(params={})
    find(:all, :from=>:friends_timeline)
  end

  # Get friends timeline for a specified user
  # Can be user id or username
  # Need to implement the :since param as in friends_timeline
  def self.user_and_friends_timeline(id)
    find(:all, :from=>"/statuses/friends_timeline/#{id.to_s}.xml")
  end

  # Get timeline for a user
  # Need to implement :count (limit 20) and :since timestamp
  def self.user_timeline(id)
    find(:all, :from=>"/statuses/user_timeline/#{id.to_s}.xml")
  end

  # Get a specific status
  # Not really RESTful because the 'show' part is extraneous
  def self.show(id)
    find(:one, :from=>"/statuses/show/#{id.to_s}.xml")
  end
  
  def self.update_status(content)
    connection.post("/statuses/update.xml?status="+CGI.escape(content))
  end

  def self.direct_message(username,content)
    connection.post("/direct_messages/new.xml?user="+username+"&text="+content)    
  end

  def self.send_to_user(username,content)
    connection.post("/statuses/update.xml?status="+CGI.escape("@"+username+" "+content))
  end
  
  def save_as_message
    message = Message.create({
      :author => self.user.name,
      :source => "twitter",
      :text => self.text,
      :created_at => Time.parse(self.created_at)
    })
    unless self.user.location.nil?
      message.location_string = self.user.location
    end
    message.save
  end
  
end
