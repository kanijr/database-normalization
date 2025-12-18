import _ from "lodash";

export default function combineNNF(nf1Tables) {
  const orders = nf1Tables.orders.map(
    ({
      customer_first_name,
      customer_last_name,
      delivery_region,
      delivery_city,
      delivery_street,
      delivery_house,
      delivery_apartment,
      warehouse_region,
      warehouse_city,
      warehouse_street,
      warehouse_building,
      warehouse_apartment,
      ...order
    }) => {
      const customer_full_name = `${customer_first_name} ${customer_last_name}`;

      const delivery_address = `${delivery_region}, ${delivery_city}, ${delivery_street}, ${delivery_house}, ${delivery_apartment}`;
      const warehouse_address = `${warehouse_region}, ${warehouse_city}, ${warehouse_street}, ${warehouse_building}, ${warehouse_apartment}`;
      const emails = [];
      const phones = [];
      nf1Tables.supplier_contacts
        .filter((sc) => sc.supplier_name === order.supplier_name)
        .forEach(({ supplier_name, phone, email }) => {
          if (!_.includes(emails, email)) {
            emails.push(email);
          }
          if (!_.includes(phones, phone)) {
            phones.push(phone);
          }
        });
      return {
        ...order,
        customer_full_name,
        delivery_address,
        supplier_phones: phones.join(", "),
        supplier_emails: emails.join(", "),
        warehouse_address,
      };
    }
  );

  const products_stock = nf1Tables.products_stock.map(
    ({
      warehouse_region,
      warehouse_city,
      warehouse_street,
      warehouse_building,
      warehouse_apartment,
      ...ps
    }) => {
      const emails = [];
      const phones = [];
      nf1Tables.supplier_contacts
        .filter((sc) => sc.supplier_name === ps.supplier_name)
        .forEach(({ supplier_name, phone, email }) => {
          if (!_.includes(emails, email)) {
            emails.push(email);
          }
          if (!_.includes(phones, phone)) {
            phones.push(phone);
          }
        });
      const warehouse_address = `${warehouse_region}, ${warehouse_city}, ${warehouse_street}, ${warehouse_building}, ${warehouse_apartment}`;

      return {
        ...ps,
        warehouse_address,
        supplier_phones: phones.join(", "),
        supplier_emails: emails.join(", "),
      };
    }
  );

  return {
    products_stock,
    orders,
  };
}
