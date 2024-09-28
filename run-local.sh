#! /bin/bash

docker build --no-cache . -t signal-service
docker run -it --env-file .env -p 8080:8080 signal-service
# docker compose up