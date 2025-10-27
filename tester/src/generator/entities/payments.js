import { fakerUK as faker } from "@faker-js/faker";

export function generatePaymentMethods() {
  const paymentTypes = [
    "Credit Card",
    "Debit Card",
    "PayPal",
    "Apple Pay",
    "Google Pay",
    "Cash on Delivery",
  ];

  return Array.from({ length: paymentTypes.length }, (v, i) => ({
    id: i + 1,
    method_name: paymentTypes[i],
    payment_fee: faker.finance.amount({ min: 2, max: 50, dec: 2 }),
  }));
}
