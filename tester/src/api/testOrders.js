import _ from "lodash";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let datas = [];

const customer = [1, "Артем", "Слободян", "Artem_Slobodyan@gmail.com"];
const param = [
  `customer_full_name=${customer[1]} ${customer[2]}&customer_email=${customer[3]}&`,
  `customer_first_name=${customer[1]}&customer_last_name=${customer[2]}&customer_email=${customer[3]}&`,
  `customer_first_name=${customer[1]}&customer_last_name=${customer[2]}&customer_email=${customer[3]}&`,
  `customer_id=${customer[0]}&`,
  `customer_id=${customer[0]}&`,
  `customer_id=${customer[0]}&`,
];
const limit = 20;
const hasParam = false;

await fetch(`http://localhost:3000/api/nnf/orders?limit=${limit}`);
await sleep(1000);

const res = await fetch(
  `http://localhost:3000/api/nnf/orders?${
    hasParam ? param[0] : ""
  }limit=${limit}`
);
const data = await res.json();

if (data.error) {
  console.log(data.error);
  process.exit(1);
}
datas.push(data);
let d = `Orders: NNF durations in API: ${data.durationMs} ms, duratinos in db client: ${data.durationInDb}`;
console.log(d.replaceAll(".", ","));
await sleep(1000);

for (let i = 1; i <= 5; i++) {
  const res = await fetch(
    `http://localhost:3000/api/nf${i}/orders?${
      hasParam ? param[i] : ""
    }limit=${limit}`
  );
  const data = await res.json();

  if (data.error) {
    console.log(data.error);
    process.exit(1);
  }
  datas.push(data);
  let d = `Orders: NF${i} durations in API: ${data.durationMs} ms, duratinos in db client: ${data.durationInDb}`;
  console.log(d.replaceAll(".", ","));
  await sleep(1000);
}

console.log("Length = " + datas[0].rows.length);
console.log();

for (let i = 2; i < datas.length; i++) {
  console.log(
    `Orders in NF1 and NF${i} is equal: ` +
      _.isEqual(datas[1].rows, datas[i].rows)
  );
}
