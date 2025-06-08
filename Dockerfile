# syntax=docker/dockerfile:1

FROM debian:bookworm AS debinstall
SHELL [ "/bin/bash", "-c" ]
RUN apt-get update
RUN --mount=type=cache,uid=0,gid=0,target=/var/cache/apt apt-get --yes install npm mariadb-server curl git
COPY .env /root/.env

FROM debinstall AS git
RUN git clone https://github.com/jeniferirwin/bbcguild-discordbot.git
RUN mv /root/.env /bbcguild-discordbot/.env

FROM git AS setup
WORKDIR /bbcguild-discordbot
RUN ./setup.sh

FROM setup AS build

ENTRYPOINT [ "/bin/bash", "/bbcguild-discordbot/entrypoint.sh" ]