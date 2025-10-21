import { faker } from "@faker-js/faker";
import { SIZE_PRESETS } from "./generator/config/sizes.js";
import { generateAndUpload } from "./generator/generator.js";

const sizes = Object.keys(SIZE_PRESETS);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  for (const size of sizes) {
    console.log("\nGenerate and upload datas");
    const nf3Tables = await generateAndUpload(size);
    const customer = faker.helpers.arrayElement(nf3Tables.customers);

    await sleep(2000);

    console.log(
      `\nTest duration of get all orders in size: ${SIZE_PRESETS[size].order_items}`
    );

    await fetch(`http://localhost:3000/api/nf1/allOrders`);

    for (let i = 1; i <= 5; i++) {
      await sleep(1000);
      const res = await fetch(`http://localhost:3000/api/nf${i}/allOrders`);
      const data = await res.json();

      if (data.error) {
        console.log(data.error);
        process.exit(1);
      }

      console.log(`NF${i}: ${data.durationMs} ms`);
    }

    console.log(`\nTest duration of get orders by customer`);

    const nf1Res = await fetch(
      `http://localhost:3000/api/nf1/ordersByCustomer?customer_first_name=${customer.first_name}&` +
        `customer_last_name=${customer.last_name}&customer_email=${customer.email}`
    );
    const nf1Data = await nf1Res.json();

    if (nf1Data.error) {
      console.log(nf1Data.error);
      process.exit(1);
    }

    console.log(`NF1: ${nf1Data.durationMs} ms`);

    for (let i = 2; i <= 5; i++) {
      await sleep(1000);
      const res = await fetch(
        `http://localhost:3000/api/nf${i}/ordersByCustomer?customer_id=${customer.id}`
      );
      const data = await res.json();

      if (data.error) {
        console.log(data.error);
        process.exit(1);
      }

      console.log(`NF${i}: ${data.durationMs} ms`);
    }

    console.log(`Customer id: ${customer.id}, orders:${nf1Data.rows.length}`);

    console.log(
      `\nTest duration of get all products stock in size: ${SIZE_PRESETS[size].product_supplier_warehouse}`
    );

    for (let i = 1; i <= 5; i++) {
      await sleep(1000);
      const res = await fetch(
        `http://localhost:3000/api/nf${i}/allProducts_stock`
      );
      const data = await res.json();

      if (data.error) {
        console.log(data.error);
        process.exit(1);
      }

      console.log(`NF${i}: ${data.durationMs} ms`);
    }
  }
} catch (err) {
  console.log(err);
}
