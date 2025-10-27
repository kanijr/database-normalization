import { fakerUK as faker } from "@faker-js/faker";

export function generateWarehouses(addresses, n = 20) {
  const names = [];
  return Array.from({ length: n }, (v, i) => {
    const address = faker.helpers.arrayElement(addresses);
    let name = `Warehouse ${faker.commerce.department()} #${faker.number.int({
      min: 1,
      max: 10,
    })}`;

    if (names.includes(name)) {
      while (names.includes(name)) {
        name = `Warehouse ${faker.commerce.department()} #${faker.number.int({
          min: 1,
          max: 10,
        })}`;
      }
    }
    names.push(name);

    return {
      id: i + 1,
      warehouse_name: name,
      address_id: address.id,
    };
  });
}
