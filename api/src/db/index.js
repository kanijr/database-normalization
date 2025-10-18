import { Pool } from "pg";

// Створюю з'єднання дз базою даних
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "shop_normalization",
  password: "root",
  port: 5432,
  idleTimeoutMillis: 0, // відключаю заморожування з'єднання при відсутності запитів
});

export default pool;
