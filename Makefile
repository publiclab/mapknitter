export COMPOSE_HTTP_TIMEOUT=360

define wait_for_container
	@while ! docker logs mapknitter | grep "web server started"; do\
		echo "Serving Mapknitter";\
		sleep 10;\
	done;
endef

build:
	cp config/database.yml.example config/database.yml
	cp config/amazon_s3.yml.example config/amazon_s3.yml
	cp config/config.yml.example config/config.yml
	cp db/schema.rb.example db/schema.rb
	docker-compose build

deploy-container:
	docker-compose up -d
	$(call wait_for_container)

redeploy-container:
	docker-compose down --remove-orphans
	docker-compose up --force-recreate -d
	$(call wait_for_container)
	docker exec -e DISABLE_DATABASE_ENVIRONMENT_CHECK=1 mapknitter bash -lc \
												"bundle exec rails db:drop && \
												 bundle exec rails db:create && \
												 bundle exec rails db:schema:load && \
												 bundle exec rails db:migrate"
