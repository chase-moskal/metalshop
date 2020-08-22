
FROM nginx:1.19.2
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY . /usr/share/nginx/html
RUN cd /usr/share/nginx/html && rm -rf scripts nginx.conf package-lock.json
