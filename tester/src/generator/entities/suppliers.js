import { fakerUK as faker } from "@faker-js/faker";

export function generateSuppliers(n = 30) {
  return Array.from({ length: n }, (v, i) => ({
    id: i + 1,
    supplier_name: faker.company.name(),
  }));
}

export function generateSupplierContacts(suppliers) {
  const contacts = [];

  for (const supplier of suppliers) {
    const phoneCount = faker.number.int({ min: 1, max: 3 });
    const emailCount = faker.number.int({ min: 1, max: 3 });

    const phones = Array.from({ length: phoneCount }, () =>
      faker.phone.number({ style: "international" })
    );

    const emails = Array.from({ length: emailCount }, (_, i) =>
      faker.internet.email({
        firstName: supplier.supplier_name,
        lastName: i,
      })
    );

    const recordCount = Math.max(phoneCount, emailCount);

    for (let i = 0; i < recordCount; i++) {
      contacts.push({
        supplier_id: supplier.id,
        phone: phones[i % phoneCount],
        email: emails[i % emailCount],
      });
    }
  }

  // Додаємо id після генерації всіх
  return contacts;
}
