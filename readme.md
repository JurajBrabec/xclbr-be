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

mkdir be
git clone https://<token>@github.com/JurajBrabec/xclbr-be.git .
cd be/mailer
sudo docker build --tag 'xclbr-mailer' .
sudo docker run -d xclbr-mailer
cd ../api
sudo docker build --tag 'xclbr-api' .
sudo docker run -d xclbr-api
