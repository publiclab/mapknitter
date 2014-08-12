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

    
  # The priority is based upon order of creation: first created -> highest priority.

  # Sample of regular route:
  #   app.connect 'products/:id', :controller => 'catalog', :action => 'view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   app.purchase 'products/:id/purchase', :controller => 'catalog', :action => 'purchase'
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   app.resources :products

  # Sample resource route with options:
  #   app.resources :products, :member => { :short => :get, :toggle => :post }, :collection => { :sold => :get }

  # Sample resource route with sub-resources:
  #   app.resources :products, :has_many => [ :comments, :sales ], :has_one => :seller
  
  # Sample resource route with more complex sub-resources
  #   app.resources :products do |products|
  #     products.resources :comments
  #     products.resources :sales, :collection => { :recent => :get }
  #   end

  # Sample resource route within a namespace:
  #   app.namespace :admin do |admin|
  #     # Directs /admin/products/* to Admin::ProductsController (app/controllers/admin/products_controller.rb)
  #     admin.resources :products
  #   end

  # You can have the root of your site routed with app.root -- just remember to delete public/index.html.
  # app.root :controller => "welcome"

  # See how all your routes lay out with "rake routes"

  # Install the default routes as the lowest priority.
  # Note: These default routes make all actions in every controller accessible via GET requests. You should
  # consider removing the them or commenting them out if you're using named routes and resources.

  # Registered user pages:
  app.profile '/profile', :controller => 'users', :action => 'profile', :id => 0
  app.profile '/profile/:id', :controller => 'users', :action => 'profile'
  app.dashboard '/dashboard', :controller => 'users', :action => 'dashboard'
  app.assign '/assign/:id', :controller => 'map', :action => 'assign'
  #app.comments '/comments', :controller => 'users', :action => 'comments'

  app.root :controller => "maps", :action => "index"
  app.connect 'sorter/', :controller => "utility", :action => "sorter"

  # app.connect 'tms/:id/alt/:z/:x/:y.png', :controller => "utility", :action => "tms_alt"
  # app.connect 'tms/:id/', :controller => "utility", :action => "tms_info"
  # app.connect 'tms/:id/alt/', :controller => "utility", :action => "tms_info"
  # app.connect 'stylesheet/:id.gss', :controller => "map", :action => "stylesheet"
  # app.connect 'maps', :controller => "map", :action => "index"
  # app.connect 'maps/:id', :controller => "map", :action => "show"
  # app.connect 'import/:name', :controller => "warper", :action => "import"

  # app.connect 'authors', :controller => 'users', :action => 'authors'
  # app.connect 'author/list', :controller => 'author', :action => 'list'
  # app.connect 'author/emails', :controller => 'author', :action => 'emails'
  # app.connect 'author/:id', :controller => 'author', :action => 'show'
  # app.connect 'api/0.6/geohash/:id.json', :controller => 'api', :action => 'planet'

  app.resources :maps

  # default routes
  # app.connect ':controller/:action/:id'
  # app.connect ':controller.:format'
  # app.connect ':controller/:action.:format'
  # app.connect ':controller/:action/:id.:format'
end
