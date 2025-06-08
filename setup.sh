export $(grep -v '^#' .env | xargs)
service mariadb start
echo "CREATE USER IF NOT EXISTS ${BOTNAME}@localhost; GRANT ALL PRIVILEGES ON *.* TO ${BOTNAME}@localhost; FLUSH PRIVILEGES;" | mysql
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
source ~/.bashrc
nvm install 22.9.0
nvm use 22.9.0
npm install -g npm@11.4.1
npm install prisma
npm audit fix
npx prisma migrate dev --name init
