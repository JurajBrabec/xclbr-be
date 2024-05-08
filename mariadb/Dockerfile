#based on https://stackoverflow.com/questions/48306277/chown-changing-ownership-of-var-lib-mysql-operation-not-permitted
FROM mariadb:10.11
RUN chmod g+rwx /var/lib/mysql /var/run /var/log/mysql
COPY ./xclbr.sql /docker-entrypoint-initdb.d/
ENV MYSQL_DATABASE="xclbr"
USER mysql
EXPOSE 3306