import { fakerUK as faker } from "@faker-js/faker";

export function generateDeliveryAddresses(regions, n = 50) {
  const blockLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
  return Array.from({ length: n }, (v, i) => {
    const region = faker.helpers.arrayElement(regions);
    const hasBlock = Math.random() < 0.2;

    const blockSuffix = faker.helpers.maybe(
      () => faker.number.int({ min: 1, max: 3 }),
      { probability: 0.4 }
    );

    return {
      id: i + 1,
      region_id: region.id,
      city: faker.location.city(),
      street: faker.location.street(),
      house: faker.location.buildingNumber(),
      apartment: hasBlock
        ? faker.helpers.arrayElement(blockLabels) + (blockSuffix || "")
        : null,
    };
  });
}
