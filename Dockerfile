FROM node:7.3.0-alpine
RUN addgroup -S node && adduser -S -g node node 

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app
EXPOSE 8080

CMD [ "npm", "start" ]

