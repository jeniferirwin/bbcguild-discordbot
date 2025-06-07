export $(grep -v '^#' .env | xargs) &&
service mariadb start &&
echo "CREATE USER ${BOTNAME}@localhost; GRANT ALL PRIVILEGES ON *.* TO ${BOTNAME}@localhost; FLUSH PRIVILEGES;" | mysql &&
cd /root &&
npm install prisma -g &&
npx prisma migrate dev --name init

