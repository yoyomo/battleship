Rails.application.routes.draw do
  resources :boards
  resources :users do
  	member do
  		get :active_board
  	end
  end
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
