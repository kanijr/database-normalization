import { fakerUK as faker } from "@faker-js/faker";

export function generateRegions(n = 27) {
  const uniqueRegion = new Set();
  const result = [];

  const limit = Math.min(n, 27);

  while (result.length < limit) {
    let region = faker.location.state();
    if (!uniqueRegion.has(region)) {
      uniqueRegion.add(region);
      result.push({
        id: result.length + 1,
        region_name: region,
      });
    }
  }

  return result;
}
