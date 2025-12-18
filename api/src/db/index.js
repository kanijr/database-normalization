import { Pool } from "pg";

// const createClient = () =>
//   new Client({
//     user: "postgres",
//     host: "localhost",
//     database: "shop_normalization",
//     password: "root",
//     port: 5432,
//   });

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "shop_normalization",
  password: "root",
  port: 5432,
  idleTimeoutMillis: 30000000,
});

export default pool;
