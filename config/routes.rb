Mapknitter::Application.routes.draw do

  root to: 'front_ui#index'

  get 'front-page', to: 'front_ui#index'
  get 'mappers', to: 'front_ui#nearby_mappers'
  get 'about', to: 'front_ui#about'
  post 'save_location' => 'front_ui#save_location'
  get 'all_maps', to: 'front_ui#all_maps'
  get 'legacy' => 'maps#index' # remove once new front page is stable

  post 'save_location', to: 'front_ui#save_location'

  get 'external_url_test', to: 'export#external_url_test'
  get 'local/:login', to: 'sessions#local'
  get 'logout', to: 'sessions#logout'
  get 'login', to: 'sessions#new'
  get 'register', to: 'users#create'
  get 'signup', to: 'users#new'

  # since rails 3.2, we use this to log in:
  get 'sessions/create', to: 'sessions#create'

  resources :users, :sessions, :maps, :images, :comments, :tags

  # redirect legacy route:
  get 'tag/:id', to: redirect('/tags/%{id}')

  # Registered user pages:
  get 'profile', to: 'users#profile', id: 0
  get 'profile/:id', to: 'users#profile'
  get 'dashboard', to: 'users#dashboard'

  get 'authors', to: 'users#index'

  get 'images/:url', to: 'images#fetch'

  get 'tms/:id/alt/:z/:x/:y.png', to: 'utility#tms_alt'
  get 'tms/:id/', to: 'utility#tms_info'
  get 'tms/:id/alt/', to: 'utility#tms_info'

  # once we have string-based ids, reorganize these around 'maps' and resourceful routing
  get 'search/:id', to: 'maps#search'
  get 'search', to: 'maps#search'
  get 'maps/:id/warpables', to: 'maps#images' # deprecate this in favor of resourceful route below; this is just to override maps/:id
  get 'maps/view/:id', to: redirect('/maps/%{id}') # legacy
  get 'export/progress/:id', to: 'export#progress'
  get 'export/status/:id', to: 'export#status'
  get 'exports', to: 'export#index'
  post 'export' => 'export#create'
  get 'map/:id', to: redirect('/maps/%{id}')
  get 'embed/:id', to: 'maps#embed'
  post 'maps/:map_id/warpables', to: 'images#create' # deprecate this in favor of resourceful route below; this is just to override maps/:id
  post 'maps/export/:id', to: 'maps#export'
  post 'maps/:id', to: 'maps#export'

  get 'import/:name', to: 'images#import' # this was for auto-adding images via URL

  namespace 'feeds' do
    %w(all clean).each do |action|
      get action, action: action, format: 'rss'
    end

    %w(license author tag).each do |action|
      get action + "/:id", action: action, format: 'rss'
    end
  end

  namespace 'maps' do
    %w(map featured).each do |action|
      get action, action: action
    end

    %w(archive exports region license).each do |action|
      get action + "/:id", action: action
    end

    %w(annotate warpables).each do |action|
      get "/:id/" + action, action: action
    end
  end

  namespace 'export' do
    %w(index logger jpg geotiff cancel 
    progress status external_url_test).each do |action|
      post action + "/:id", action: action
    end
  end

  # make these resourceful after renaming warpables to images
  post 'warper/update', to: 'images#update' # legacy for cartagen.js
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
