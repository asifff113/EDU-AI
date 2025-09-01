.PHONY: init dev migrate seed docker-up docker-down

init:
	corepack enable
	corepack prepare pnpm@9 --activate
	pnpm install
	pnpm -F api prisma:generate

dev:
	pnpm dev

migrate:
	pnpm -F api prisma:migrate

seed:
	pnpm -F api prisma:seed

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down -v


