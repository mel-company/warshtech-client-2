/** يفتح واتساب برسالة جاهزة. أرقام العراق 07… تتحول إلى 9647… */
export function whatsappHref(
  phone: string | null | undefined,
  message: string,
): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `964${digits.slice(1)}`;
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function invoiceWhatsappMessage(input: {
  workshopName?: string;
  invoiceNumber: string;
  buyerName: string;
  finalPrice: number;
  currency: string;
  deliveryCode?: string | null;
}): string {
  const lines = [
    input.workshopName ? input.workshopName : "الورشة",
    `فاتورة ${input.invoiceNumber}`,
    input.buyerName,
    `المبلغ: ${input.finalPrice} ${input.currency}`,
  ];
  if (input.deliveryCode) {
    lines.push(`كود تسليم السيارة: ${input.deliveryCode}`);
  }
  return lines.join("\n");
}

export function maintenanceWhatsappMessage(input: {
  customerName: string;
  carLabel: string;
  when: string;
}): string {
  return [
    `تذكير صيانة`,
    input.customerName,
    input.carLabel,
    input.when,
  ].join("\n");
}
