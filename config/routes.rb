ActionController::Routing::Routes.draw do |map|
    
  # The priority is based upon order of creation: first created -> highest priority.

  # Sample of regular route:
  #   map.connect 'products/:id', :controller => 'catalog', :action => 'view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   map.purchase 'products/:id/purchase', :controller => 'catalog', :action => 'purchase'
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   map.resources :products

  # Sample resource route with options:
  #   map.resources :products, :member => { :short => :get, :toggle => :post }, :collection => { :sold => :get }

  # Sample resource route with sub-resources:
  #   map.resources :products, :has_many => [ :comments, :sales ], :has_one => :seller
  
  # Sample resource route with more complex sub-resources
  #   map.resources :products do |products|
  #     products.resources :comments
  #     products.resources :sales, :collection => { :recent => :get }
  #   end

  # Sample resource route within a namespace:
  #   map.namespace :admin do |admin|
  #     # Directs /admin/products/* to Admin::ProductsController (app/controllers/admin/products_controller.rb)
  #     admin.resources :products
  #   end

  # You can have the root of your site routed with map.root -- just remember to delete public/index.html.
  # map.root :controller => "welcome"

  # See how all your routes lay out with "rake routes"

  # Install the default routes as the lowest priority.
  # Note: These default routes make all actions in every controller accessible via GET requests. You should
  # consider removing the them or commenting them out if you're using named routes and resources.

  map.root :controller => "map", :action => "index"

  map.connect 'tms/:id/alt/:z/:x/:y.png', :controller => "utility", :action => "tms_alt"
  map.connect 'stylesheet/:id.gss', :controller => "map", :action => "stylesheet"
  map.connect 'maps', :controller => "map", :action => "index"
  map.connect 'maps/:id', :controller => "map", :action => "show"
  map.connect 'import/:name', :controller => "warper", :action => "import"

  map.connect 'author/list', :controller => 'author', :action => 'list'
  map.connect 'author/emails', :controller => 'author', :action => 'emails'
  map.connect 'author/:id', :controller => 'author', :action => 'show'
  map.connect 'api/0.6/geohash/:id.json', :controller => 'api', :action => 'planet'

  map.connect ':controller/:action/:id'
  map.connect ':controller.:format'
  map.connect ':controller/:action.:format'
  map.connect ':controller/:action/:id.:format'
end
