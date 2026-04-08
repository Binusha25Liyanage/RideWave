install:
	npm install --workspaces

dev:
	docker compose -f infra/docker-compose.yml up --build

db:migrate:
	npm run db:migrate --workspaces --if-present

db:seed:
	npm run db:seed --workspaces --if-present

test:
	npm run test --workspaces --if-present

build:
	npm run build --workspaces --if-present

k8s:deploy:
	kubectl apply -f infra/k8s/
