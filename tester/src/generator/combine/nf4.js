export default function combineNF4(nf3Tables) {
  const { supplier_contacts, ...tables } = nf3Tables;

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
    supplier_contact_phones,
    supplier_contact_emails,
  };
}
