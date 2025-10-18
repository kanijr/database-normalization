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

export function generateDeliveryRegionPayments(
  deliveryTypes,
  regions,
  payments,
  n = 55
) {
  const uniqueCombinations = new Set();
  const results = [];

  const limit = Math.min(
    n,
    Math.max(
      payments.length * deliveryTypes.length,
      payments.length * regions.length
    )
  );

  while (results.length < limit) {
    const delivery = faker.helpers.arrayElement(deliveryTypes);
    const region = faker.helpers.arrayElement(regions);
    const payment = faker.helpers.arrayElement(payments);

    const key = `${delivery.id}-${region.id}-${payment.id}`;
    if (!uniqueCombinations.has(key)) {
      uniqueCombinations.add(key);
      results.push({
        delivery_method_id: delivery.id,
        region_id: region.id,
        payment_method_id: payment.id,
      });
    }
  }
  return results;
}
