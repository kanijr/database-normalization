import _ from "lodash";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let datas = [];
const supplier = [8, "ТОВ Трясило"];
// const supplier = [2, "ПрАТ ЧернівціТорг"];
const param = [
  `supplier_name=${supplier[1]}&`,
  `supplier_name=${supplier[1]}&`,
  `supplier_name=${supplier[1]}&`,
  `supplier_id=${supplier[0]}&`,
  `supplier_id=${supplier[0]}&`,
  `supplier_id=${supplier[0]}&`,
];
const limit = 100;
const hasParam = false;

await fetch(`http://localhost:3000/api/nnf/productsStock?limit=${limit}`);
await sleep(1000);

const res = await fetch(
  `http://localhost:3000/api/nnf/productsStock?${
    hasParam ? param[0] : ""
  }limit=${limit}`
);
const data = await res.json();

if (data.error) {
  console.log(data.error);
  process.exit(1);
}
datas.push(data);
let d = `Products stock: NNF durations in API: ${data.durationMs} ms, duratinos in db client: ${data.durationInDb}`;
console.log(d.replaceAll(".", ","));
await sleep(1000);
for (let i = 1; i <= 5; i++) {
  const res = await fetch(
    `http://localhost:3000/api/nf${i}/productsStock?${
      hasParam ? param[i - 1] : ""
    }limit=${limit}`
  );
  const data = await res.json();

  if (data.error) {
    console.log(data.error);
    process.exit(1);
  }
  let d = `Products stock: NF${i} durations in API: ${data.durationMs} ms, duratinos in db client: ${data.durationInDb}`;
  console.log(d.replaceAll(".", ","));
  datas.push(data);
  await sleep(1000);
}

console.log("Length = " + datas[0].rows.length);
console.log();

for (let i = 1; i < 5; i++) {
  console.log(
    `Products stock in NF1 and NF${i + 1} is equal: ` +
      _.isEqual(datas[1].rows, datas[i].rows)
  );
}

console.log(
  datas
    .map(({ durationMs, durationInDb }) => `${durationMs};${durationInDb}`)
    .join(";")
    .replaceAll(".", ",")
);

// datas[0].rows.forEach((e, i) => {
//   if (!_.isEqual(e, datas[2].rows[i])) {
//     console.log(e);
//     console.log(datas[2].rows[i]);
//     console.log(i);
//     process.exit(1);
//   }
// });
