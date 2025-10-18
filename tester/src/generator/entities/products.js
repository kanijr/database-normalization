import { fakerUK as faker } from "@faker-js/faker";

export function generateCategories(n = 30) {
  return Array.from({ length: n }, (v, i) => ({
    id: i + 1,
    category_name: faker.commerce.department(),
  }));
}

export function generateProducts(categories, n = 100) {
  return Array.from({ length: n }, (v, i) => {
    const category = faker.helpers.arrayElement(categories);
    return {
      id: i + 1,
      product_name: faker.commerce.productName(),
      category_id: category.id,
      price: faker.commerce.price({ min: 20, dec: 2 }),
    };
  });
}
