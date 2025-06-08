# BBCGuild Discord Bot

This is a Discord bot designed for an Elder Scrolls Online trading guild. Most successful trading guilds track their member contributions. This bot allows members of the guild to quickly see where they stand with their contributions.

# Caveats
By itself, the bot will not do anything useful. It needs to be accompanied by a very specifically formatted Google Sheet and a particular script for that sheet. Examples of those things are not currently available because we have not yet standardized them. I plan to make templates available in the future. If you are interested in this bot and don't want to wait for templates, contact me and I'll see what I can do to help you get set up.

The current version of this app was cannibalized from an old, unmaintained version of itself. As such, I do not fully understand all of the technologies that went into the original version. However, I attempted to package the app in a way that makes it as user-friendly as possible.

# Bot Creation

If I have vanished and you are the new maintainer of BBCGuild's own bot, ask guildmaster Hiyde for the environment variables that I gave him. These will include the string required to access our version of the bot.

If you're setting up a brand new one, you will need to do so in the Discord Developer Portal. That process is mostly out of the scope of this README; there are lots of videos and tutorials out there on how to do it.

Here are the settings you need to enable for a new bot:

**SCOPES**

- applications.commands
- bot

**PERMISSIONS**

- Embed Links
- Send Messages
- View Channels

**INTENTS**

- Server Members
- Message Content

# Environment Variables

Before launching or building an image, you must have a proper `.env` file. `.env.example` will give you a starting point - you can just copy it as `.env` in the same directory and go from there.

# App Installation
This app was built for and tested on the following platforms:

- Docker Desktop for Windows 4.41.2
- fly.io (fly.exe v0.3.140)
- Debian Bookworm

# Docker

If you want to use Docker, you'll need to install Docker on your system. Instructions for doing this can be found at: https://docs.docker.com/engine/install/

Once installed, clone this repository, open a terminal in the cloned folder, and type:

`docker build --target build -t BOTNAME:latest .`

... where 'BOTNAME' is whatever you want. This is not going to be shown anywhere on the bot itself. This name is simply the name of the Docker image that you're creating.

Once the image is built, run it with:

`docker run BOTNAME:latest`

You can also boot it using the Docker Desktop interface.

# fly.io

If you want to use fly.io, you will need to install `flyctl` on your system. Instructions for doing this can be found at: https://fly.io/docs/flyctl/install/

Once installed, clone this repository, open a terminal in the cloned folder, and simply type: `flyctl launch`

When it asks you if you want to copy the fly.toml configuration to the new app, put 'yes'.

When asked if you want to tweak settings, put 'no' unless you do actually have a specific change to make.

The rest of the process should unfold automatically, and your bot will go up all by itself!

# Debian

If you don't want a container at all, here's how to install it directly:

```
git clone https://github.com/jeniferirwin/bbcguild-discordbot
cd bbcguild-discordbot
cp .env.example .env
```
Make the necessary changes to `.env`, then...

```
sudo ./setup.sh
./start-bot.sh
```
