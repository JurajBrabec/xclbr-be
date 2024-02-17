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
