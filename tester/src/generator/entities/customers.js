import { fakerUK as faker } from "@faker-js/faker";

export function generateCustomers(n = 100) {
  return Array.from({ length: n }, (v, i) => {
    const first_name = faker.person.firstName();
    const last_name = faker.person.lastName();
    return {
      id: i + 1,
      first_name,
      last_name,
      email: faker.internet.email({
        firstName: first_name,
        lastName: last_name,
      }),
    };
  });
}
