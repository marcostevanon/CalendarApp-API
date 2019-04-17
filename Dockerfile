FROM node:10-alpine
WORKDIR /home/app
COPY package.json .
RUN npm i
COPY . .