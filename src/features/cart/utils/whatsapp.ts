import type { CartItem } from '../context/CartContext';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  DEFAULT_WHATSAPP_NUMBER,
  normalizeWhatsappNumber,
} from '@/features/catalog/services/publicCatalogService';

interface BuildWhatsAppOrderParams {
  items: CartItem[];
  subtotal: number;
  customerName?: string;
  deliveryNotes?: string;
  whatsappPhone?: string;
  storeName?: string;
}

export function buildWhatsAppOrderMessage({
  items,
  subtotal,
  customerName = '',
  deliveryNotes = '',
  storeName = 'MARJAV PERFUMES',
}: BuildWhatsAppOrderParams): string {
  const lines: string[] = [
    `Hola *${storeName.toUpperCase()}*, me gustaría realizar el siguiente pedido:`,
    '',
  ];

  items.forEach(({ perfume, quantity }, index) => {
    const lineTotal = formatCurrency(perfume.price * quantity, perfume.currency);
    lines.push(
      `${index + 1}. *${perfume.name}* (${perfume.concentration} · ${perfume.volumeMl} ml)`
    );
    lines.push(`   Cantidad: ${quantity} — Subtotal: ${lineTotal}`);
  });

  lines.push('');
  lines.push(`*Total estimado:* ${formatCurrency(subtotal)}`);

  if (customerName.trim()) {
    lines.push(`*Nombre:* ${customerName.trim()}`);
  }

  if (deliveryNotes.trim()) {
    lines.push(`*Notas / Entrega:* ${deliveryNotes.trim()}`);
  }

  lines.push('');
  lines.push('Quedo atento(a) para confirmar disponibilidad y método de pago. ¡Gracias!');

  return lines.join('\n');
}

export function buildWhatsAppOrderUrl(params: BuildWhatsAppOrderParams): string {
  const cleanPhone = normalizeWhatsappNumber(
    params.whatsappPhone || DEFAULT_WHATSAPP_NUMBER
  );
  const message = buildWhatsAppOrderMessage(params);
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}