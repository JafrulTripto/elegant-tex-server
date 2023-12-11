up:
	docker-compose up -d
down:
	docker-compose down
restart:
	docker-compose restart
migrate:
	docker-compose exec app php artisan migrate
seed:
	docker-compose exec app php artisan db:seed
