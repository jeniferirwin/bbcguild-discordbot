# syntax=docker/dockerfile:1

FROM debian:trixie-slim AS debinstall
SHELL [ "/bin/bash", "-c" ]
RUN apt-get update
RUN --mount=type=cache,uid=0,gid=0,target=/var/cache/apt apt-get --yes install npm mariadb-server

FROM debinstall AS setup
WORKDIR /root
COPY init.sql .
COPY prisma .
COPY bot.js .
COPY entrypoint.sh .
COPY start-bot.sh .
COPY package.json .
COPY setup.sh .
COPY .env .
COPY node_modules .
RUN /root/setup.sh

FROM setup AS build

ENTRYPOINT [ "/bin/bash", "/root/entrypoint.sh" ]