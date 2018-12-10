
FROM node:latest
RUN npm set unsafe-perm true

RUN mkdir /app
WORKDIR /app

COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
