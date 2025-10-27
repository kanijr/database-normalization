import _ from "lodash";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let datas = [];

await fetch(`http://localhost:3000/api/nf3/allOrders?`);
await sleep(2000);
for (let i = 1; i <= 5; i++) {
  const res = await fetch(`http://localhost:3000/api/nf${i}/allOrders?`);
  const data = await res.json();

  if (data.error) {
    console.log(data.error);
    process.exit(1);
  }
  datas.push(data);
  console.log(`Orders: durations from NF${i}: ${data.durationMs} ms`);
  await sleep(2000);
}

// const res1 = await fetch(
//   `http://localhost:3000/api/nf1/ordersByCustomer?customer_first_name="Ярослав"&` +
//     `customer_last_name="Сідлецька"&customer_email="Yaroslav.Suudletsukka45@yandex.ua"`
// );
// const data1 = await res1.json();

// if (data1.error) {
//   console.log(data1.error);
//   process.exit(1);
// }

// console.log(`Orders: durations from NF1: ${data1.durationMs} ms`);
// datas.push(data1);
// await sleep(1000);

// for (let i = 2; i <= 5; i++) {
//   const res = await fetch(
//     `http://localhost:3000/api/nf${i}/ordersByCustomer?customer_id=1`
//   );
//   const data = await res.json();

//   if (data.error) {
//     console.log(data.error);
//     process.exit(1);
//   }

//   console.log(`Orders: durations from NF${i}: ${data.durationMs} ms`);
//   datas.push(data);
//   await sleep(1000);
// }

console.log();

for (let i = 1; i < datas.length; i++) {
  console.log(
    `Orders in NF1 and NF${i + 1} is equal: ` +
      _.isEqual(datas[0].rows, datas[i].rows)
  );
}
