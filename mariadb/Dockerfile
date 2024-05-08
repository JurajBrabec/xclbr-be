#based on https://stackoverflow.com/questions/48306277/chown-changing-ownership-of-var-lib-mysql-operation-not-permitted
FROM centos/mariadb-102-centos7
COPY ./xclbr.sql /docker-entrypoint-initdb.d/
ENV MYSQL_DATABASE="xclbr"
EXPOSE 3306