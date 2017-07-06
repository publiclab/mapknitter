Mapknitter::Application.routes.draw do
  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # these are a mess:
  get 'local/:login' => 'sessions#local'
  get 'logout' => 'sessions#logout'
  get 'login' => 'sessions#new'
  get 'register' => 'users#create'
  get 'signup' => 'users#new'

  # since rails 3.2, we use this to log in:
  get 'sessions/create' => 'sessions#create'
  # believe this is unnecessary:
  #get 'session' => 'sessions#create', :conditions => { :method => :get }

  resources :users, :sessions

  # redirect legacy route:
  get 'tag/:id', to: redirect('/tags/%{id}')
  get 'tags/:id' => 'tags#show'

  # Registered user pages:
  get 'profile' => 'users#profile', :id => 0
  get 'profile/:id' => 'users#profile'
  get 'dashboard' => 'users#dashboard'

  get 'authors' => 'users#index'

  get 'feeds/all' => 'feeds#all', :format => 'rss'
  get 'feeds/license/:id' => 'feeds#license', :format => 'rss'
  get 'feeds/author/:id' => 'feeds#author', :format => 'rss'
  get 'feeds/tag/:id' => 'feeds#tag', :format => 'rss'

  get 'tms/:id/alt/:z/:x/:y.png' => 'utility#tms_alt'
  get 'tms/:id/' => 'utility#tms_info'
  get 'tms/:id/alt/' => 'utility#tms_info'

  # once we have string-based ids, reorganize these around 'maps' and resourceful routing
  get 'maps' => 'maps#index'
  post 'maps' => 'maps#create' # legacy, will be replaced by resourceful route
  get 'map/map' => 'maps#map'
  put 'map/:id' => 'maps#update' # legacy, will be replaced by resourceful route
  get 'search/:id' => 'maps#search'
  get 'search' => 'maps#search'
  get 'map/update/:id' => 'maps#update' # legacy
  get 'map/archive/:id' => 'maps#archive'
  get 'map/region/:id' => 'maps#region'
  get 'map/license/:id' => 'maps#license'
  get 'maps/featured' => 'maps#featured'
  get 'map/view/:id', to: redirect('/maps/%{id}') # legacy
  get 'maps/new' => 'maps#new' # legacy, will be replaced by resourceful route
  get 'maps/:id/edit' => 'maps#edit' # legacy, will be replaced by resourceful route
  get 'maps/:id/annotate' => 'maps#annotate'
  get 'maps/exports/:id' => 'maps#exports'
  get 'maps/:id/warpables' => 'maps#images' # deprecate this in favor of resourceful route below; this is just to override maps/:id
  post 'maps/:map_id/warpables' => 'images#create' # deprecate this in favor of resourceful route below; this is just to override maps/:id
  get 'export/progress/:id' => 'export#progress'
  get 'exports' => 'export#index'
  get 'maps/:id' => 'maps#show'
  get 'map/:id', to: redirect('/maps/%{id}')
  get 'embed/:id' => 'maps#embed'
  post 'maps/export/:id' => 'maps#export'
  post 'maps/:id' => 'maps#export'

  get 'import/:name' => 'images#import' # this was for auto-adding images via URL
  post 'export/:action/:id' => 'export'

  # make these resourceful after renaming warpables to images
  post 'images/create/:id' => 'images#create' # used?
  post 'warper/update' => 'images#update' # legacy for cartagen.js
  post 'images/update' => 'images#update'
  post 'images/delete/:id' => 'images#delete'
  delete 'maps/:map_id/warpables/:id' => 'images#destroy' #legacy, will be resourceful
  delete 'images/:id' => 'images#destroy' #legacy, will be resourceful

  # You can have the root of your site routed with 'root'
  # just remember to delete public/index.html.
  root :to => 'maps#index'

  # RESTful API
  resources :maps do
    resources :tags
    resources :comments
    resources :warpables
    resources :annotations
    member do
      get :search
    end
  end

  # See how all your routes lay out with 'rake routes'

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  get ':controller/:action'
  get ':controller/:action/:id'
  get ':controller/:action.:format'
  get ':controller/:action/:id.:format'

end
