ActionController::Routing::Routes.draw do |app|
  app.local '/local/:login', :controller => 'sessions', :action => 'local'
  app.logout '/logout', :controller => 'sessions', :action => 'destroy'
  app.login '/login', :controller => 'sessions', :action => 'new'
  app.register '/register', :controller => 'users', :action => 'create'
  app.signup '/signup', :controller => 'users', :action => 'new'
  app.resources :users
  app.tags '/tag/create', :controller => 'tag', :action => 'create'
  app.tags '/tag/:id', :controller => 'tag', :action => 'show'

  app.open_id_complete '/session', :controller => "session", :action => "create", :conditions => { :method => :get }
  app.resource :session

  # Registered user pages:
  app.profile '/profile', :controller => 'users', :action => 'profile', :id => 0
  app.profile '/profile/:id', :controller => 'users', :action => 'profile'
  app.dashboard '/dashboard', :controller => 'users', :action => 'dashboard'
  app.assign '/assign/:id', :controller => 'map', :action => 'assign'

  app.root :controller => "maps", :action => "index"
  app.connect 'sorter/', :controller => "utility", :action => "sorter"

  # RESTful API
  app.resources :maps do |maps|
    maps.resources :tags
    maps.resources :comments
    maps.resources :warpables
  end

  #Beta Pages
  app.connect 'beta', :controller => "beta", :action => "index"
  app.connect 'beta/maps/:id', :controller => "beta", :action => "show"

  # Beta Warper controller, handling uploads
  app.connect 'betawarper/:map_id', :controller => 'betawarper', :action => 'show', :conditions => { :method => :get }, :requirements => { :map_id => /\d+/ }
  app.connect 'betawarper/:id', :controller => 'betawarper', :action => 'create', :conditions => { :method => :post }, :requirements => { :id => /\d+/ }
end
