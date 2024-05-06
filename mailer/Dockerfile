FROM node:18
WORKDIR /usr/src/app
COPY . .
WORKDIR /usr/src/app/mailer
RUN npm install
RUN npm run build
EXPOSE 50051
CMD [ "npm", "run" , "dev" ]
