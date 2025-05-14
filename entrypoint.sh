export $(grep -v '^#' .env | xargs) &&
service mariadb start &&
mysql < init.sql &&
cd /root &&
npm install prisma -g &&
npx prisma migrate dev --name init &&
bash start-bot.sh