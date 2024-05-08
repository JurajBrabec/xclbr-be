FROM nginx:stable
RUN sed -i.bak 's/^user/#user/' /etc/nginx/nginx.conf
RUN sed -i.bak 's/listen\(.*\)80;/listen 8080;/' /etc/nginx/conf.d/default.conf
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx
WORKDIR /usr/share/nginx/html
COPY index.html .
EXPOSE 8081
