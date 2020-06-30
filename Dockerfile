FROM node:12.13.0

ENV HOME_DIR /home/node
ENV DIR $HOME_DIR/server

RUN mkdir -p /var/www/html/images
RUN mkdir -p /var/www/html/files

WORKDIR $DIR

COPY package*.json ./

RUN npm $NPM_COMMAND

COPY . .

EXPOSE $PORT
