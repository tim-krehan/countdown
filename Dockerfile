FROM docker.io/nginx:alpine
WORKDIR /usr/share/nginx/html

COPY static/ /usr/share/nginx/html/
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh
EXPOSE 80

CMD ["/bin/sh", "/startup.sh"]

