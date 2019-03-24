export COMPOSE_HTTP_TIMEOUT=360

build:
	cp config/database.yml.example config/database.yml
	cp config/config.yml.example config/config.yml
	cp config/initializers/recaptcha.rb.example config/initializers/recaptcha.rb
	cp db/schema.rb.example db/schema.rb
	docker-compose build
	docker-compose run --rm web bash -l -c "sleep 10 && bower install --allow-root && rake db:setup && rake db:migrate && rake assets:precompile"

deploy-container:
	docker-compose up -d

redeploy-container:
	docker-compose up --force-recreate -d
	docker-compose exec web bash -l -c "sleep 10 && rake db:migrate && rake assets:precompile"
