const API_BASE_URL = "http://localhost:3000/api";

export async function truncateSchema(schema) {
  const res = await fetch(`${API_BASE_URL}/${schema}/truncate`);
  return res.json();
}

export async function insertData(schema, key, values) {
  const max = 2400;
  const l = Math.ceil(values.length / max);
  const results = [];

  for (let i = 0; i < l; i++) {
    const subValues = values.slice(i * max, (i + 1) * max);

    const res = await fetch(`${API_BASE_URL}/${schema}/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: subValues }),
    });
    const data = await res.json();
    if (data.error) {
      throw new Error(`${data.errorFrom}: ${data.error}`);
    }
    results.push(data);
  }
  return results;
}
