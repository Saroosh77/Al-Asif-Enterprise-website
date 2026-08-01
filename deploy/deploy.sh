#!/usr/bin/env sh
set -eu

if [ ! -f .env.production ]; then
  cp .env.example .env.production
  echo "Created .env.production. Edit it with your domain and email credentials, then run this script again."
  exit 1
fi

if grep -q "example.com\|replace-with-an-app-password" .env.production; then
  echo "Update every placeholder in .env.production before deploying."
  exit 1
fi

docker compose --env-file .env.production up -d --build
docker compose ps
echo "Deployment started. HTTPS will become available after your domain DNS points to this server."
