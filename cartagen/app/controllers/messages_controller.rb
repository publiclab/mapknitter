class MessagesController < ApplicationController

  def index
    @tweet = Tweet.find(:all, :from=>"/statuses/friends_timeline/whooz.xml")
    render :xml => @tweet
  end
  
  def status_update
    Tweet.update_status(params[:status])
    @tweets = Tweet.find(:all, :from=>"/statuses/user_timeline/whooz.xml")
    render :xml => @tweets
  end

  def update_friend
    Tweet.direct_message('l20amesstCambri','This is only for you eyes')
    @tweets = Tweet.find(:all, :from=>"/statuses/friends_timeline/l20amesstCambri.xml")
    render :xml => @tweets
  end
  
  def import
    last_message = Message.find(:last,:conditions => ['source = "twitter"'])
    since = (last_message.created_at+1.second).strftime("%a%%2C+%d+%b+%Y+%H%%3A%M%%3A%S+GMT")
    new_tweets = Tweet.find(:all, :from=>"/statuses/friends_timeline/whooz.xml?since="+since)
    puts since
    new_tweets.each do |tweet|
      begin
        tweet.save_as_message
      rescue
        puts "GEOCODING ERROR: "+tweet.inspect
      end
    end
    render :xml => Message.find(:all)
  end
  
  def messages
    render :xml => Message.find(:all)
  end
  
  def keyvalues
    render :xml => Keyvalue.find(:all, :conditions => {:message_id => params[:id]})
  end

end