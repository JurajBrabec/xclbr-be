#!/bin/sh

sudo docker run -d --name xclbr-mailer -p 50051:50051 xclbr-mailer:latest
sudo docker run -d -e MAILER_ADDR=xclbr-mailer:50051 --name xclbr-api -p 3000:3000 xclbr-api:latest
