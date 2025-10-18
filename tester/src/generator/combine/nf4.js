export default function combineNF4(nf3Tables) {
  const { delivery_region_payments, supplier_contacts, ...tables } = nf3Tables;

  const delivery_payments = [];
  const region_payments = [];

  const seenDelivery = new Set();
  const seenRegion = new Set();
  nf3Tables.delivery_region_payments.forEach(
    ({ delivery_method_id, region_id, payment_method_id }) => {
      const deliveryKey = `${delivery_method_id}-${payment_method_id}`;
      if (!seenDelivery.has(deliveryKey)) {
        seenDelivery.add(deliveryKey);
        delivery_payments.push({ delivery_method_id, payment_method_id });
      }
      const regionKey = `${region_id}-${payment_method_id}`;
      if (!seenRegion.has(regionKey)) {
        seenRegion.add(regionKey);
        region_payments.push({ region_id, payment_method_id });
      }
    }
  );

  const supplier_contact_phones = [];
  const supplier_contact_emails = [];

  const seenPhones = new Set();
  const seenEmails = new Set();

  nf3Tables.supplier_contacts.forEach(({ supplier_id, phone, email }) => {
    const phoneKey = `${supplier_id}-${phone}`;
    if (!seenPhones.has(phoneKey)) {
      seenPhones.add(phoneKey);
      supplier_contact_phones.push({ supplier_id, phone });
    }
    const emailKey = `${supplier_id}-${email}`;
    if (!seenEmails.has(emailKey)) {
      seenEmails.add(emailKey);
      supplier_contact_emails.push({ supplier_id, email });
    }
  });

  return {
    ...tables,
    delivery_payments,
    region_payments,
    supplier_contact_phones,
    supplier_contact_emails,
  };
}
