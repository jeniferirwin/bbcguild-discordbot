export $(grep -v '^#' .env | xargs) &&
service mariadb start &&
echo "CREATE USER ${BOTNAME}@localhost; GRANT ALL PRIVILEGES ON *.* TO ${BOTNAME}@localhost; FLUSH PRIVILEGES;" | mysql &&
npm install prisma -g &&
npx prisma migrate dev --name init
