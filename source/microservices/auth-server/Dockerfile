
FROM node:13

RUN mkdir /app
WORKDIR /app

COPY . .
RUN npm install
RUN npm run prepare

EXPOSE 8000
CMD [ "npm", "start" ]
