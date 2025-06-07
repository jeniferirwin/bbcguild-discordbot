export $(grep -v '^#' .env | xargs)
sudo service mariadb start
sudo echo "CREATE USER IF NOT EXISTS ${BOTNAME}@localhost; GRANT ALL PRIVILEGES ON *.* TO ${BOTNAME}@localhost; FLUSH PRIVILEGES;" | mysql
npm install prisma
npx prisma migrate dev --name init
