-include .env
export
.DEFAULT_GOAL := build

COMPOSE=docker compose
DOCKER_COMPOSE_YML=docker-compose.yml

DATABASE_NAME = $(POSTGRES_SERVICE)
COLOR_BOLD_BLACK=\033[1;30m
COLOR_BOLD_RED=\033[1;31m
COLOR_BOLD_GREEN=\033[1;32m
COLOR_BOLD_YELLOW=\033[1;33m
COLOR_BOLD_BLUE=\033[1;34m
COLOR_BOLD_MAGENTA=\033[1;35m
COLOR_BOLD_CYAN=\033[1;36m
COLOR_BOLD_WHITE=\033[1;37m

.PHONY: dockerfile dockerfile_clean

build:
	@echo "$(COLOR_BOLD_BLUE)"
	@echo "Checking for .env file..."
	@echo "$(COLOR_BOLD_YELLOW)"
	@if [ ! -f .env ]; then \
		echo "Please user <make env-dev> to generate first a env file."; \
		exit 1; \
	fi
	@echo "Building..."
	$(COMPOSE) -f $(DOCKER_COMPOSE_YML) up -d --build
	

env:
	bash ./config/prod-config.sh
env-dev:
	bash ./config/dev-config.sh
clean-env:
	rm .env
re: dockerfile
	@echo "Stopping Docker containers..."
	$(COMPOSE) down
	@echo "Rebuilding Docker images..."
	$(COMPOSE) -f $(DOCKER_COMPOSE_YML) build
	@echo "Relaunching Docker containers..."
	$(COMPOSE) -f $(DOCKER_COMPOSE_YML) up -d

stop:
	@echo "Stopping Docker containers..."
	$(COMPOSE) -f $(DOCKER_COMPOSE_YML) down
	@echo ".env deleted" 

clean: dockerfile_clean
	@echo "Removing Docker containers and images..."
	$(COMPOSE) down --volumes
fclean:clean
	docker network prune -f
	docker system prune -af
	rm .env
backend-logs:
	@echo "Showing logs for the backend service..."
	$(COMPOSE) logs -f $(BACKEND_SERVICE)

frontend-logs:
	@echo "Showing logs for the frontend service..."
	$(COMPOSE) logs -f $(FRONTEND_SERVICE)

run-dev:
	cp .env ./backend/
	cp .env ./pong/
	@echo "Building Dev images..."
	$(COMPOSE) -f docker-compose-dev.yml up -d
	@echo "$(COLOR_BOLD_YELLOW)"
	@echo "Database IP: $$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(DATABASE_NAME))"
	@echo "Don't forget to change the host of <./backend/src/app.module.ts> in case the backend can't connect to the database."
	@echo "$(COLOR_BOLD_RED)If does not work locally with server running on local, change .env DB_HOST to localhost from both .env in backend and from root of transcedence$(COLOR_BOLD_WHITE)"

run-ip:
	@echo "$(COLOR_BOLD_YELLOW)"
	@echo "Database IP: $$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(DATABASE_NAME))"
stop-dev:
	@echo "Stopping Dev containers..."
	$(COMPOSE) -f docker-compose-dev.yml down

# .PHONY: build run stop clean
