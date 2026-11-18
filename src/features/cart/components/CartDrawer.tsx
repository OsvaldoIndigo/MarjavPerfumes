import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { useCart } from '@/features/cart/context/CartContext';
import { buildWhatsAppOrderUrl } from '@/features/cart/utils/whatsapp';
import { usePublicSettings } from '@/features/catalog/context/PublicSettingsContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/Button';

export function CartDrawer() {
  const {
    items,
    isOpen,
    summary,
    error,
    clearError,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const settings = usePublicSettings();

  const [customerName, setCustomerName] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setConfirmClear(false);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const hasUnavailableItems = items.some((item) => !item.perfume.inStock);
  const canCheckout = items.length > 0 && !hasUnavailableItems;

  const whatsappOrderUrl = canCheckout
    ? buildWhatsAppOrderUrl({
        items,
        subtotal: summary.total,
        customerName,
        deliveryNotes,
        whatsappPhone: settings.whatsapp_number,
        storeName: settings.store_name,
      })
    : '#';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Cesta de selección"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar cesta"
        onClick={closeCart}
        className="fixed inset-0 bg-obsidian/55 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Drawer */}
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-ivory border-l border-hairline shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-champagne-dark stroke-[1.6]" />
            <h2 className="font-brand text-xs sm:text-sm tracking-[0.18em] uppercase text-obsidian">
              Tu Cesta ({summary.totalUnits})
            </h2>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Cerrar panel"
            className="p-1.5 text-stone hover:text-obsidian transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Banner de error si existe */}
        {error && (
          <div className="bg-obsidian text-ivory px-5 py-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-champagne shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-[11px] underline text-champagne cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Contenido */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="w-10 h-10 text-stone/40 stroke-[1.2] mb-4" />
            <h3 className="font-serif text-2xl text-obsidian">
              Tu cesta está vacía
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-stone max-w-xs leading-relaxed">
              Explora nuestras fragancias exclusivas y agrega tus favoritas para armar tu pedido.
            </p>
            <div className="mt-6">
              <Link to="/catalogo" onClick={closeCart}>
                <Button variant="primary">Explorar catálogo</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Lista de fragancias */}
            <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-hairline">
              {items.map(({ perfume, quantity }) => (
                <div key={perfume.id} className="py-4 first:pt-0 flex gap-3.5">
                  <Link
                    to={`/catalogo/${perfume.slug}`}
                    onClick={closeCart}
                    className="w-16 h-20 bg-sand border border-hairline shrink-0 overflow-hidden"
                  >
                    <img
                      src={perfume.imageUrl}
                      alt={perfume.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/catalogo/${perfume.slug}`}
                          onClick={closeCart}
                          className="font-serif text-base text-obsidian hover:text-champagne-dark transition-colors line-clamp-1"
                        >
                          {perfume.name}
                        </Link>
                        <p className="text-[11px] text-stone">
                          {perfume.brand} · {perfume.concentration} ({perfume.volumeMl} ml)
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(perfume.id)}
                        aria-label={`Eliminar ${perfume.name}`}
                        className="p-1 text-stone/70 hover:text-obsidian transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center border border-hairline bg-sand/40">
                        <button
                          type="button"
                          onClick={() => updateQuantity(perfume.id, quantity - 1)}
                          aria-label="Disminuir cantidad"
                          className="px-2 py-1 text-obsidian hover:bg-sand transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-medium text-obsidian">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(perfume.id, quantity + 1)}
                          aria-label="Aumentar cantidad"
                          className="px-2 py-1 text-obsidian hover:bg-sand transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="block text-xs sm:text-sm font-medium text-obsidian">
                          {formatCurrency(perfume.price * quantity, perfume.currency)}
                        </span>
                        {quantity > 1 && (
                          <span className="block text-[10px] text-stone">
                            {formatCurrency(perfume.price, perfume.currency)} c/u
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Datos opcionales del cliente */}
              <div className="pt-4 space-y-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone">
                  Datos para tu pedido (opcional)
                </p>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-3 py-2 bg-transparent border border-hairline text-xs text-obsidian placeholder:text-stone/70 focus:outline-none focus:border-obsidian"
                />
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Ciudad, colonia o nota de entrega"
                  className="w-full px-3 py-2 bg-transparent border border-hairline text-xs text-obsidian placeholder:text-stone/70 focus:outline-none focus:border-obsidian"
                />
              </div>
            </div>

            {/* Resumen financiero + Acción WhatsApp */}
            <div className="border-t border-hairline bg-sand/45 p-5 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone">
                  <span>
                    Subtotal ({summary.totalUnits}{' '}
                    {summary.totalUnits === 1 ? 'unidad' : 'unidades'})
                  </span>
                  <span>{formatCurrency(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone">
                  <span>Envío</span>
                  <span>Por coordinar</span>
                </div>
              </div>

              <div className="pt-2 border-t border-hairline flex items-center justify-between">
                <span className="uppercase tracking-[0.14em] text-xs font-medium text-obsidian">
                  Total estimado
                </span>
                <span className="font-serif text-xl font-medium text-obsidian">
                  {formatCurrency(summary.total)}
                </span>
              </div>

              {canCheckout ? (
                <a
                  href={whatsappOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 bg-obsidian text-ivory hover:bg-obsidian/90 px-5 py-3.5 text-xs uppercase tracking-[0.16em] font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-champagne stroke-[1.7]" />
                  <span>Enviar pedido por WhatsApp</span>
                </a>
              ) : (
                <Button variant="primary" fullWidth disabled>
                  Revisa disponibilidad en tu cesta
                </Button>
              )}

              <div className="flex items-center justify-between pt-1">
                {!confirmClear ? (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="text-[11px] text-stone hover:text-obsidian underline underline-offset-4 cursor-pointer"
                  >
                    Vaciar cesta
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-obsidian font-medium">¿Confirmar?</span>
                    <button
                      type="button"
                      onClick={() => {
                        clearCart();
                        setConfirmClear(false);
                      }}
                      className="text-champagne-dark font-semibold underline cursor-pointer"
                    >
                      Sí, vaciar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="text-stone underline cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                <Link
                  to="/catalogo"
                  onClick={closeCart}
                  className="text-[11px] text-obsidian hover:text-champagne-dark underline underline-offset-4"
                >
                  Seguir explorando
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}