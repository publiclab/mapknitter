export COMPOSE_HTTP_TIMEOUT=360
export COMPOSE_PROJECT_NAME

build:
	cp config/database.yml.example config/database.yml
	cp config/config.yml.example config/config.yml
	cp config/initializers/recaptcha.rb.example config/initializers/recaptcha.rb
	cp config/amazon_s3.yml.example config/amazon_s3.yml
	cp db/schema.rb.example db/schema.rb
	docker-compose down --remove-orphans
	docker-compose build

deploy-container:
	docker-compose run --rm web bash -l -c "sleep 10 && bower install --allow-root && rake db:setup && rake db:migrate && rake assets:precompile"
	docker-compose up -d
	docker-compose exec -T web bash -l -c "sleep 10 && rake db:setup && rake db:migrate && rake assets:precompile"

redeploy-container:
	docker-compose up --force-recreate -d
	docker-compose exec -T web bash -l -c "sleep 10 && rake db:migrate && rake assets:precompile"
