import _ from "lodash";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let datas = [];

await fetch(`http://localhost:3000/api/nf1/allProducts_stock`);
await sleep(1000);
for (let i = 1; i <= 5; i++) {
  const res = await fetch(`http://localhost:3000/api/nf${i}/allProducts_stock`);
  const data = await res.json();
  console.log(`Products stock: durations from NF${i}: ${data.durationMs} ms`);
  datas.push(data);
  await sleep(1000);
}

console.log();

for (let i = 1; i < 5; i++) {
  console.log(
    `Products stock in NF1 and NF${i + 1} is equal: ` +
      _.isEqual(datas[0].rows, datas[i].rows)
  );
}
