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
