import { fakerUK as faker } from "@faker-js/faker";

export function generateDeliveryMethods() {
  const deliveryTypes = [
    "Courier Delivery",
    "Pickup Point",
    "Postal Service",
    "Drone Delivery",
    "In-store Pickup",
    "Express Delivery",
  ];

  return Array.from({ length: deliveryTypes.length }, (v, i) => ({
    id: i + 1,
    method_name: deliveryTypes[i],
    delivery_fee: faker.finance.amount({ min: 20, max: 400, dec: 2 }),
  }));
}
