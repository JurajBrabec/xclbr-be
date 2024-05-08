#based on https://stackoverflow.com/questions/48306277/chown-changing-ownership-of-var-lib-mysql-operation-not-permitted
FROM mariadb:10.11
ENV MYSQL_DATABASE="xclbr"
COPY ./xclbr.sql /docker-entrypoint-initdb.d/
USER mysql
EXPOSE 3306