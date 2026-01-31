FROM docker.io/nginx:alpine
WORKDIR /usr/share/nginx/html

COPY static/ /usr/share/nginx/html/

EXPOSE 80
