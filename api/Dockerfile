FROM node:18
WORKDIR /usr/src/app
COPY . .
WORKDIR /usr/src/app/api
RUN npm install
EXPOSE 3000
CMD [ "ts-node", "src/client.js" ]