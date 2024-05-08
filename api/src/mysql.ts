import { Request, Response } from 'express';
import mysql from 'mysql';

const MYSQL_HOST = process.env.MYSQL_HOST || 'xclbr-mariadb';
const MYSQL_USER = process.env.MYSQL_USER || 'xclbr';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'xclbr123';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'xclbr';
const connection = mysql.createConnection({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
});

export default async (request: Request, response: Response) => {
  try {
    const query = 'SELECT * FROM users;';
    connection.query(query, (err, results) => {
      if (err) throw err;
      response.status(200).send({ data: results });
    });
  } catch (error) {
    console.error('Error reading data:', error);
    response.status(500).json({ message: 'Internal server error' });
  }
};
