FROM    node:18

WORKDIR /pong
COPY    . .

EXPOSE  3000

RUN     apt update -y
RUN     apt install host -y
RUN     npm install
RUN     chmod +x ./frontend.sh

CMD     /bin/bash -c "./frontend.sh && npm start"
