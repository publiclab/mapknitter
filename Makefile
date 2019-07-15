export COMPOSE_HTTP_TIMEOUT=360

build:
	cp config/database.yml.example config/database.yml
	cp config/amazon_s3.yml.example config/amazon_s3.yml
	cp config/config.yml.example config/config.yml
	cp db/schema.rb.example db/schema.rb
	docker-compose build

deploy-container:
	docker-compose up -d
	while ! docker logs mapknitter | grep "web server started"; do\
		echo "Serving Mapknitter";\
		sleep 10;\
	done;

redeploy-container:
	docker-compose down --remove-orphans
	docker volume rm -f mapknitter_yarn_cache mapknitter_bundle_cache
	docker-compose up --force-recreate -d
	docker exec -it -e DISABLE_DATABASE_ENVIRONMENT_CHECK=1mapknitter bash -lc\
												"bundle exec rails db:reset && \
												 bundle exec rails db:migrate"
	while ! docker logs mapknitter | grep "web server started"; do\
		echo "Serving Mapknitter";\
		sleep 10;\
	done;
