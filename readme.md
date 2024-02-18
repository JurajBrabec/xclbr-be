\*\* Prerequisites
npm install -g typescript @types/node ts-node

\*\* Setup
mkdir be/api be/mailer
cd be/mailer
npm init -y
tsc --init

npm install @grpc/grpc-js @grpc/proto-loader grpc-tools ini nodemailer pug
npm install --save-dev @types/ini @types/nodemailer @types/pug

API
npm install express
npm install --save-dev @types/express

git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/JurajBrabec/xclbr.git
git push -u origin main

\*\* Run
git clone https://<token>@github.com/JurajBrabec/xclbr-be.git
cd xclbr-be
bash build-images.sh
#sudo docker build --tag 'xclbr-mailer' -f mailer/Dockerfile .
#sudo docker build --tag xclbr-api -f api/Dockerfile .
bash start-containers.sh
#sudo docker run -d --name xclbr-mailer -p 50051:50051 xclbr-mailer:latest
#sudo docker run -d --name xclbr-api -p 3000:3000 xclbr-api:latest
#OR
#docker compose up -d
