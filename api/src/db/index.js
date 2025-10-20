import { Client } from "pg";

const createClient = () =>
  new Client({
    user: "postgres",
    host: "localhost",
    database: "shop_normalization",
    password: "root",
    port: 5432,
  });

export default createClient;
