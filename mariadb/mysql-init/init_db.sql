CREATE DATABASE IF NOT EXISTS xclbr;

GRANT ALL PRIVILEGES ON xclbr.* TO 'xclbr'@'localhost';

USE xclbr;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

INSERT INTO users (name, email) VALUES
  ('John Doe', 'john@xclbr.com'),
  ('Jane Smith', 'jane@xclbr.com'),
  ('Bob Johnson', 'bob@xclbr.com');
