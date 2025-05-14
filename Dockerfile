# syntax=docker/dockerfile:1

FROM debian:trixie-slim AS debinstall
SHELL [ "/bin/bash", "-c" ]
RUN apt-get update
RUN --mount=type=cache,uid=0,gid=0,target=/var/cache/apt apt-get --yes install npm mariadb-server

FROM debinstall AS build
WORKDIR /root
COPY init.sql .
COPY prisma .
COPY bot.js .
COPY entrypoint.sh .
COPY start-bot.sh .
COPY package.json .
COPY .env .

# Comment out the below line if you want a smaller image. This will make spin-up time significantly
# longer, however, as it has to build all of the modules each time.
COPY node_modules .

ENTRYPOINT [ "/bin/bash", "/root/entrypoint.sh" ]