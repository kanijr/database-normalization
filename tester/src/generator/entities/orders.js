import { fakerUK as faker } from "@faker-js/faker";

export function generateOrders(
  customers,
  deliveryMethods,
  paymentMethods,
  addresses,
  n = 200
) {
  return Array.from({ length: n }, (v, i) => {
    const customer = faker.helpers.arrayElement(customers);
    const deliveryAddress = faker.helpers.arrayElement(addresses);
    const { id: payment_method_id } =
      faker.helpers.arrayElement(paymentMethods);
    const { id: delivery_method_id } =
      faker.helpers.arrayElement(deliveryMethods);

    const order_date = faker.date.past().toISOString().split("T")[0];

    return {
      id: i + 1,
      order_date,
      customer_id: customer.id,
      payment_method_id,
      delivery_method_id,
      delivery_address_id: deliveryAddress.id,
      delivery_date: faker.date
        .anytime({ refDate: order_date })
        .toISOString()
        .split("T")[0],
      delivery_status: faker.datatype.boolean(),
    };
  });
}
