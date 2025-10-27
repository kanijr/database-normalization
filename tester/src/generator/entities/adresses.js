import { fakerUK as faker } from "@faker-js/faker";
import _ from "lodash";

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

export function generateCities(regions, n = 2) {
  const result = [];

  for (const region of regions) {
    const cities = [];
    while (cities.length < n) {
      let city = faker.location.city();
      if (!cities.includes(city)) {
        cities.push(city);
        result.push({
          id: result.length + 1,
          city_name: city,
          region_id: region.id,
        });
      }
    }
  }

  return result;
}

export function generateStreets(cities, n = 3) {
  const result = [];

  for (const city of cities) {
    const streets = [];
    while (streets.length < n) {
      let street = faker.location.street();
      if (!streets.includes(street)) {
        streets.push(street);
        result.push({
          id: result.length + 1,
          street_name: street,
          city_id: city.id,
        });
      }
    }
  }

  return result;
}

export function generateAddresses(streets, n = 3) {
  const blockLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const hasBlock = Math.random() < 0.2;

  const blockSuffix = faker.helpers.maybe(
    () => faker.number.int({ min: 1, max: 3 }),
    { probability: 0.4 }
  );
  const result = [];

  for (const street of streets) {
    const buildApartm = [];
    while (buildApartm.length < n) {
      let building = faker.location.buildingNumber();
      let apartment = hasBlock
        ? faker.helpers.arrayElement(blockLabels) + (blockSuffix || "")
        : null;

      if (!buildApartm.includes(`${building}-${apartment}`)) {
        buildApartm.push(`${building}-${apartment}`);
        result.push({
          id: result.length + 1,
          building,
          apartment,
          street_id: street.id,
        });
      }
    }
  }

  return result;
}
