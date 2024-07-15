up:
	docker compose up -d
make dev-up:
	docker compose -f docker-compose.local.yml up -d
down:
	docker compose down
restart:
	docker compose restart
migrate:
	docker compose exec app php artisan migrate
seed:
	docker compose exec app php artisan db:seed
schedule:
    docker-compose exec app php artisan schedule:run >> /dev/null 2>&1
