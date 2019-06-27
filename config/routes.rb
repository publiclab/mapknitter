Mapknitter::Application.routes.draw do

  root to: 'maps#index'

  get 'front-page', to: 'front_ui#index'
  get 'mappers', to: 'front_ui#nearby_mappers'
  post 'save_location', to: 'front_ui#save_location'
  get 'about', to: 'front_ui#about'
  get 'all_maps', to: 'front_ui#all_maps'

  get 'external_url_test', to: 'export#external_url_test'
  get 'local/:login', to: 'sessions#local'
  get 'logout', to: 'sessions#logout'
  get 'login', to: 'sessions#new'
  get 'register', to: 'users#create'
  get 'signup', to: 'users#new'

  # since rails 3.2, we use this to log in:
  get 'sessions/create', to: 'sessions#create'

  resources :users, :sessions, :maps

  # redirect legacy route:
  get 'tag/:id', to: redirect('/tags/%{id}')
  get 'tags/:id', to: 'tags#show'

  # Registered user pages:
  get 'profile', to: 'users#profile', id: 0
  get 'profile/:id', to: 'users#profile'
  get 'dashboard', to: 'users#dashboard'

  get 'authors', to: 'users#index'

  resources :feeds
  get 'feeds/all', to: 'feeds#all', format: 'rss', as: 'all'
  get 'feeds/license/:id', to: 'feeds#license', format: 'rss', as: 'license'
  get 'feeds/author/:id', to: 'feeds#author', format: 'rss', as: 'author'
  get 'feeds/tag/:id', to: 'feeds#tag', format: 'rss', as: 'tag'

  get 'tms/:id/alt/:z/:x/:y.png', to: 'utility#tms_alt'
  get 'tms/:id/', to: 'utility#tms_info'
  get 'tms/:id/alt/', to: 'utility#tms_info'

  # once we have string-based ids, reorganize these around 'maps' and resourceful routing
  get 'map/map', to: 'maps#map'
  get 'search/:id', to: 'maps#search'
  get 'search', to: 'maps#search'
  get 'map/archive/:id', to: 'maps#archive'
  get 'map/region/:id', to: 'maps#region'
  get 'map/license/:id', to: 'maps#license'
  get 'maps/featured', to: 'maps#featured'
  get 'map/view/:id', to: redirect('/maps/%{id}') # legacy
  get 'maps/:id/annotate', to: 'maps#annotate'
  get 'maps/exports/:id', to: 'maps#exports'
  get 'maps/:id/warpables', to: 'maps#images' # deprecate this in favor of resourceful route below; this is just to override maps/:id
  post 'maps/:map_id/warpables', to: 'images#create' # deprecate this in favor of resourceful route below; this is just to override maps/:id
  get 'export/progress/:id', to: 'export#progress'
  get 'export/status/:id', to: 'export#status'
  get 'exports', to: 'export#index'
  get 'map/:id', to: redirect('/maps/%{id}')
  get 'embed/:id', to: 'maps#embed'
  post 'maps/export/:id', to: 'maps#export'
  post 'maps/:id', to: 'maps#export'

  get 'import/:name', to: 'images#import' # this was for auto-adding images via URL

  namespace 'export' do
    %w(index logger jpg geotiff cancel 
    progress status external_url_test).each do |action|
      post action + "/:id", action: action
    end
  end

  # make these resourceful after renaming warpables to images
  post 'images/create/:id', to: 'images#create' # used?
  post 'warper/update', to: 'images#update' # legacy for cartagen.js
  post 'images/update', to: 'images#update'
  post 'images/delete/:id', to: 'images#delete'
  delete 'maps/:map_id/warpables/:id', to: 'images#destroy' #legacy, will be resourceful
  delete 'images/:id', to: 'images#destroy' #legacy, will be resourceful

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

  # See how all your routes lay out with 'rails routes'

end
