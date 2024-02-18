Output
```sh
ubuntu@docker:~/containers/xclbr-be$ docker compose up
[+] Running 3/3
✔ Network xclbr-be_default Created 0.1s
✔ Container xclbr-api Created 0.1s
✔ Container xclbr-mailer Created 0.1s
Attaching to xclbr-api, xclbr-mailer
xclbr-mailer |
xclbr-mailer | > mailer@1.0.0 dev
xclbr-mailer | > ts-node src/server.ts
xclbr-mailer |
xclbr-api |
xclbr-api | > dev
xclbr-api | > ts-node src/client.ts
xclbr-api |
xclbr-mailer | Listening on port: 50051
xclbr-api | REST API listening on port 3000
```
