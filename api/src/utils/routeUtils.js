import pool from "../db/index.js";

export function createInsertRoute(schema, fieldKey, fieldsName) {
  return async (req, res) => {
    const data = req.body[fieldKey];
    if (!data || !data.length) {
      return res.status(400).json({ error: `Field "${fieldKey}" is required` });
    }
    try {
      const startTime = process.hrtime.bigint(); // High-resolution time start
      const sql = `INSERT INTO ${schema}.${fieldKey} (${fieldsName.join(
        ", "
      )})\nVALUES ${data.map(
        (_, i) =>
          "(" +
          fieldsName
            .map((_, j) => "$" + (i * fieldsName.length + j + 1))
            .join(", ") +
          ")"
      )};`;

      const values = [];

      for (const obj of data) values.push(...fieldsName.map((f) => obj[f]));

      const result = await pool.query(sql, values);

      const endTime = process.hrtime.bigint(); // High-resolution time end
      const durationMs = Number(endTime - startTime) / 1_000_000; // Duration in milliseconds

      res.json({
        durationInDb: await getQueryExecTime(sql),
        durationMs,
      });
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .json({ errorFrom: `${schema}.${fieldKey}`, error: err.message });
    }
  };
}

export async function getQueryExecTime(sql) {
  const result = await pool.query(
    `SELECT total_exec_time, total_plan_time FROM pg_stat_statements WHERE query LIKE $1`,
    [sql.split("\n")[0] + "%"]
  );

  await pool.query(`SELECT pg_stat_statements_reset()`);
  return result.rows[0].total_exec_time + result.rows[0].total_plan_time;
}
