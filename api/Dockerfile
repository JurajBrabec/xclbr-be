FROM node:18
WORKDIR /usr/src/app
COPY . .
WORKDIR /usr/src/app/mailer
RUN npm install
RUN npm run build
WORKDIR /usr/src/app/api
RUN npm install
EXPOSE 3000
CMD [ "npm", "run", "dev" ]
