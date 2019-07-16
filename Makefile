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
	docker-compose up --force-recreate -d
	while ! docker logs mapknitter | grep "web server started"; do\
		echo "Serving Mapknitter";\
		sleep 10;\
	done;
	docker exec -e DISABLE_DATABASE_ENVIRONMENT_CHECK=1 mapknitter bash -lc \
												"bundle exec rails db:drop && \
												 bundle exec rails db:create && \
												 bundle exec rails db:schema:load && \
												 bundle exec rails db:migrate"
