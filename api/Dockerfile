FROM node:alpine
WORKDIR /app
COPY package.json .
RUN npm install
# Pas besoin de copier . . car on utilise un bind mount dans le docker-compose.dev.yml
# en fait si on en a besoin en prod car pas de bond mount. Tant pis il sera écfrasé en dev et inutile.
COPY . .
# on aurait pu mettre la commande suivante dans le dockerfile mais on préfère la commande dans le package.json
# CMD ["nodemon", "src/index.js", "-L"]
EXPOSE 80
CMD ["npm", "start"]
