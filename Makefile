export COMPOSE_HTTP_TIMEOUT=360
export COMPOSE_PROJECT_NAME

define wait_for_container
	@while ! docker-compose logs web | grep "web server started"; do\
		echo "Serving Mapknitter";\
		sleep 10;\
	done;
endef

build:
	cp config/database.yml.example config/database.yml
	cp config/config.yml.example config/config.yml
	cp config/initializers/recaptcha.rb.example config/initializers/recaptcha.rb
	cp config/amazon_s3.yml.example config/amazon_s3.yml
	cp db/schema.rb.example db/schema.rb
	docker-compose down --remove-orphans
	docker-compose build

deploy-container:
	docker-compose up -d
	$(call wait_for_container)

redeploy-container:
	docker-compose down --remove-orphans
	docker-compose up --force-recreate -d
	$(call wait_for_container)
	docker-compose run -e "DISABLE_DATABASE_ENVIRONMENT_CHECK=1" --rm web bash -lc \
			      "bundle exec rails db:migrate"
