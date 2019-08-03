Mapknitter::Application.routes.draw do

  root :to => 'front_ui#index'

  get 'legacy' => 'maps#index' # remove once new front page is stable
  get 'front-page' => 'front_ui#index'
  get 'mappers' => 'front_ui#nearby_mappers'
  get 'gallery' => 'front_ui#gallery'
  post "save_location" => 'front_ui#save_location'
  get 'about' => 'front_ui#about'
  get 'all_maps' => 'front_ui#all_maps'
  get 'anonymous' => 'front_ui#anonymous'

  get 'external_url_test' => 'export#external_url_test'
  get 'local/:login' => 'sessions#local'
  get 'logout' => 'sessions#logout'
  get 'login' => 'sessions#new'
  get 'register' => 'users#create'
  get 'signup' => 'users#new'

  # since rails 3.2, we use this to log in:
  get 'sessions/create' => 'sessions#create'

  resources :users, :sessions, :maps

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
  get 'map/map' => 'maps#map'
  get 'search/:id' => 'maps#search'
  get 'search' => 'maps#search'
  get 'map/archive/:id' => 'maps#archive'
  get 'map/region/:id' => 'maps#region'
  get 'map/license/:id' => 'maps#license'
  get 'maps/featured' => 'maps#featured'
  get 'map/view/:id', to: redirect('/maps/%{id}') # legacy
  get 'maps/:id/annotate' => 'maps#annotate'
  get 'maps/exports/:id' => 'maps#exports'
  get 'maps/:id/warpables' => 'maps#images' # deprecate this in favor of resourceful route below; this is just to override maps/:id
  post 'maps/:map_id/warpables' => 'images#create' # deprecate this in favor of resourceful route below; this is just to override maps/:id
  get 'export/progress/:id' => 'export#progress'
  get 'export/status/:id' => 'export#status'
  post 'export' => 'export#create'
  get 'exports' => 'export#index'
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
  get 'images/revert' => 'images#revert'
  delete 'maps/:map_id/warpables/:id' => 'images#destroy' #legacy, will be resourceful
  delete 'images/:id' => 'images#destroy' #legacy, will be resourceful

  # RESTful API
  resources :maps do
    resources :tags,  only: [:create, :show, :destroy]
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
