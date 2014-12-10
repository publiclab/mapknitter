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

  resources :users

  get 'tag/create' => 'tag#create'
  get 'tag/:id' => 'tag#show'

  get 'session' => 'session#create', :conditions => { :method => :get }
  resources :session

  # Registered user pages:
  get 'profile' => 'users#profile', :id => 0
  get 'profile/:id' => 'users#profile'
  get 'dashboard' => 'users#dashboard'
  get 'assign/:id' => 'map#assign'
  #map.comments '/comments' => 'users#comments'

  get 'sorter/' => 'utility#sorter'

  get 'tms/:id/alt/:z/:x/:y.png' => 'utility#tms_alt'
  get 'tms/:id/' => 'utility#tms_info'
  get 'tms/:id/alt/' => 'utility#tms_info'
  get 'stylesheet/:id.gss' => 'map#stylesheet'
  get 'maps' => 'map#index'
  post 'maps' => 'map#create'
  get 'map/create/:id' => 'map#index'
  get 'maps/:id' => 'map#show'
  get 'map/embed/:id' => 'annotation#embed'
  get 'import/:name' => 'warper#import'

  get 'authors' => 'users#authors'
  get 'author/list' => 'author#list'
  get 'author/emails' => 'author#emails'
  get 'author/:id' => 'author#show'
  get 'api/0.6/geohash/:id.json' => 'api#planet'

  post 'export/:action/:id' => 'export'
  post 'map/export/:id' => 'map#export'
  post 'maps/:id' => 'map#export'
  post 'warper/create/:id' => 'warper#create'
  post 'warper/update' => 'warper#update'
  post 'warper/delete/:id' => 'warper#delete'

  # You can have the root of your site routed with 'root'
  # just remember to delete public/index.html.
  root :to => 'map#index'

  # See how all your routes lay out with 'rake routes'

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'

  get ':controller/:action'
  get ':controller/:action/:id'
  #get ':controller.:format' # this doesn't work -- what's it for?
  get ':controller/:action.:format'
  get ':controller/:action/:id.:format'

end
