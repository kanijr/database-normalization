import combineNNF from "./combine/nnf.js";
import combineNF1 from "./combine/nf1.js";
import combineNF2 from "./combine/nf2.js";
import combineNF3 from "./combine/nf3.js";
import combineNF4 from "./combine/nf4.js";
import combineNF5 from "./combine/nf5.js";
import { SIZE_PRESETS } from "./config/sizes.js";
import { insertData, truncateSchema } from "./utils/api.js";
import { fakerUK as faker } from "@faker-js/faker";
import _ from "lodash";
import fs from "fs";

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

const nf3 = JSON.parse(fs.readFileSync("./nf3.json"));

const nf3N = combineNF3(SIZE_PRESETS.s02);

const delivery_address = faker.helpers.arrayElement(nf3.addresses);
const warehouses_address = faker.helpers.arrayElement(nf3.addresses);
nf3N.payment_methods = [faker.helpers.arrayElement(nf3.payment_methods)];
nf3N.delivery_methods = [faker.helpers.arrayElement(nf3.delivery_methods)];

nf3N.orders[0] = {
  ...nf3N.orders[0],
  payment_method_id: nf3N.payment_methods[0].id,
  delivery_method_id: nf3N.delivery_methods[0].id,
  delivery_address_id: delivery_address.id,
};
nf3N.warehouses[0] = {
  ...nf3N.warehouses[0],
  address_id: warehouses_address.id,
};

nf3N.addresses = [delivery_address, warehouses_address];
nf3N.streets = nf3.streets.filter(
  (v) =>
    v.id === delivery_address.street_id || v.id === warehouses_address.street_id
);
nf3N.cities = nf3.cities.filter((v) =>
  nf3N.streets.map((s) => s.city_id).includes(v.id)
);
nf3N.regions = nf3.regions.filter((v) =>
  nf3N.cities.map((c) => c.region_id).includes(v.id)
);

nf3N.supplier_contacts = [nf3N.supplier_contacts[0]];

const nf2N = combineNF2(nf3N);
const nf1N = combineNF1(nf2N);
const nnfN = combineNNF(nf1N);
const nf4N = combineNF4(nf3N);
const nf5N = combineNF5(nf4N);

delete nf3N.addresses;
delete nf3N.streets;
delete nf3N.cities;
delete nf3N.regions;
delete nf3N.delivery_methods;
delete nf3N.payment_methods;
delete nf4N.addresses;
delete nf4N.streets;
delete nf4N.cities;
delete nf4N.regions;
delete nf4N.delivery_methods;
delete nf4N.payment_methods;
delete nf5N.addresses;
delete nf5N.streets;
delete nf5N.cities;
delete nf5N.regions;
delete nf5N.delivery_methods;
delete nf5N.payment_methods;

const time = Math.floor(Date.now() / 1000);

const changeIds = (nf) => {
  Object.keys(nf).forEach((k) => {
    const keys = Object.keys(nf[k][0]).filter(
      (v) =>
        v === "id" ||
        v === "order_id" ||
        v === "customer_id" ||
        v === "category_id" ||
        v === "product_id" ||
        v === "supplier_id" ||
        v === "warehouse_id" ||
        v === "product_supplier_id" ||
        v === "supplier_warehouse_id"
    );
    keys.forEach((kk) => (nf[k][0][kk] += time));
  });
  return nf;
};

console.log("\nInserting new rows\n");
// console.log(nf3N);

await uploadSchema("nnf", changeIds(_.cloneDeep(nnfN)), false);
await uploadSchema("nf1", changeIds(_.cloneDeep(nf1N)), false);
await uploadSchema("nf2", changeIds(_.cloneDeep(nf2N)), false);
await uploadSchema("nf3", changeIds(_.cloneDeep(nf3N)), false);
await uploadSchema("nf4", changeIds(_.cloneDeep(nf4N)), false);
await uploadSchema("nf5", changeIds(_.cloneDeep(nf5N)), false);
console.log(str.replaceAll(".", ","));
