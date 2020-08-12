
FROM node:14

RUN mkdir /app
WORKDIR /app

COPY . .

EXPOSE 8000
CMD [ "node", "./dist/microservices/settings-server/main.js" ]
