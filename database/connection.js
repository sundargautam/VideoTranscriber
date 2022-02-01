import mysql from 'mysql2';
import 'dotenv/config';

var pool = mysql.createPool({
  host:process.env.DB_HOST,
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_DATABASE,
});

export default pool;