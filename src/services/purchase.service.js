import { nanoid } from 'nanoid';
import { productRepository, cartRepository, ticketRepository } from '../repositories/index.js';

export async function purchaseCart(cartId, purchaserEmail) {
  const cart = await cartRepository.getByIdPopulated(cartId).lean?.() ?? await cartRepository.getByIdPopulated(cartId);
  if (!cart || !cart.products?.length) {
    return { status: 'empty', message: 'Cart is empty' };
  }

  const purchasable = [];
  const unavailable = [];

  for (const item of cart.products) {
    const p = item.product;
    if (p.stock >= item.quantity) {
      purchasable.push({ id: p._id, price: p.price, quantity: item.quantity });
    } else {
      unavailable.push({ id: p._id, requested: item.quantity, available: p.stock });
    }
  }

  if (!purchasable.length) return { status: 'no_stock', unavailable };


  for (const it of purchasable) {
    await productRepository.decrementStock(it.id, it.quantity);
  }

  const amount = purchasable.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const code = nanoid(12);

  const ticket = await ticketRepository.create({
    code,
    amount,
    purchaser: purchaserEmail,
    items: purchasable.map(it => ({ product: it.id, quantity: it.quantity, price: it.price })),
    status: unavailable.length ? 'partial' : 'completed'
  });


  const remaining = cart.products.filter(i => unavailable.some(u => String(u.id) === String(i.product._id)));
  await cartRepository.setItems(cartId, remaining);

  return { status: ticket.status, ticket, unavailable };
}
