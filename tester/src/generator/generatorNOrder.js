import combineNNF from "./combine/nnf.js";
import combineNF1 from "./combine/nf1.js";
import combineNF2 from "./combine/nf2.js";
import combineNF3 from "./combine/nf3.js";
import combineNF4 from "./combine/nf4.js";
import combineNF5 from "./combine/nf5.js";
import { SIZE_PRESETS } from "./config/sizes.js";
import { insertData, truncateSchema } from "./utils/api.js";
import _ from "lodash";
import fs from "fs";

const nf3 = combineNF3(SIZE_PRESETS.s01);
const order = nf3.orders[1];
nf3.orders.pop();
const order_items = nf3.order_items.filter((oi) => oi.order_id === order.id);
nf3.order_items = nf3.order_items.filter((oi) => !order_items.includes(oi));

const nf2 = combineNF2(nf3);
const nf1 = combineNF1(nf2);
const nnf = combineNNF(nf1);
const nf4 = combineNF4(nf3);
const nf5 = combineNF5(nf4);
let str = "";
async function uploadSchema(schemaName, tables, truncate = true) {
  if (truncate) await truncateSchema(schemaName);
  let durationInDb = 0;
  let durationMs = 0;
  let result;
  console.log(`\n${schemaName.toUpperCase()} inserting`);

  for (const [key, value] of Object.entries(tables)) {
    result = await insertData(schemaName, key, value);
    durationInDb += result[0].durationInDb;
    durationMs += result[0].durationMs;
    console.log(
      `Table ${key}: durations in API: ${result[0].durationMs} ms, in db client: ${result[0].durationInDb} ms`
    );
  }

  console.log(
    `\nTotal durations in API: ${durationMs} ms, in db client: ${durationInDb} ms`
  );
  str += durationMs + ";" + durationInDb + ";";
}

await uploadSchema("nnf", nnf);
await uploadSchema("nf1", nf1);
await uploadSchema("nf2", nf2);
await uploadSchema("nf3", nf3);
await uploadSchema("nf4", nf4);
await uploadSchema("nf5", nf5);
console.log(str.replaceAll(".", ","));

fs.writeFileSync("./nf3.json", JSON.stringify(nf3));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// await sleep(2000);

console.log("\nInserting one order\n");

console.log(order_items.length);
str = "";
nf3.orders = [order];
nf3.order_items = [order_items[0]];
const oneOrdernf2 = combineNF2(nf3);
const oneOrdernf1 = combineNF1(oneOrdernf2);
const oneOrdernnf = combineNNF(oneOrdernf1);
const oneOrdernf4 = combineNF4(nf3);
const oneOrdernf5 = combineNF5(oneOrdernf4);

await uploadSchema("nnf", { orders: oneOrdernnf.orders }, false);
await uploadSchema("nf1", { orders: oneOrdernf1.orders }, false);
await uploadSchema(
  "nf2",
  { orders: oneOrdernf2.orders, order_items: oneOrdernf2.order_items },
  false
);
await uploadSchema(
  "nf3",
  { orders: nf3.orders, order_items: nf3.order_items },
  false
);
await uploadSchema(
  "nf4",
  { orders: oneOrdernf4.orders, order_items: oneOrdernf4.order_items },
  false
);
await uploadSchema(
  "nf5",
  { orders: oneOrdernf5.orders, order_items: oneOrdernf5.order_items },
  false
);
console.log(str.replaceAll(".", ","));
