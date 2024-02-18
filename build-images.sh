#!/bin/sh

sudo docker build --tag 'xclbr-mailer' -f mailer/Dockerfile .
sudo docker build --tag 'xclbr-api' -f api/Dockerfile .
