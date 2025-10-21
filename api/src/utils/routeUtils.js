export function createInsertRoute(createClient, schema, fieldKey, fieldsName) {
  return async (req, res) => {
    const data = req.body[fieldKey];
    if (!data || !data.length) {
      return res.status(400).json({ error: `Field "${fieldKey}" is required` });
    }
    const client = createClient();
    try {
      const sql = `INSERT INTO ${schema}.${fieldKey} (${fieldsName.join(
        ", "
      )})\nVALUES ${data.map(
        (_, i) =>
          "(" +
          fieldsName
            .map((_, j) => "$" + (i * fieldsName.length + j + 1))
            .join(", ") +
          ")"
      )} RETURNING *;`;

      const values = [];

      for (const obj of data) values.push(...fieldsName.map((f) => obj[f]));
      await client.connect();
      const result = await client.query(sql, values);
      res.json(result);
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .json({ errorFrom: `${schema}.${fieldKey}`, error: err.message });
    } finally {
      client.end();
    }
  };
}

export async function getTablesColumns(client, schema, tables) {
  const result = {};

  for (const table of tables) {
    const res = await client.query(
      `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position;
      `,
      [schema, table]
    );

    result[table] = res.rows.map((r) => r.column_name);
  }

  return result;
}
