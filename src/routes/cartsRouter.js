import { Router } from 'express';
import { requireAuth, handlePolicies } from '../middlewares/auth.js';
import { isCartOwner } from '../middlewares/ownership.js';
import { cartRepository } from '../repositories/index.js';
import { purchaseCart } from '../services/purchase.service.js';

const router = Router();


router.get('/:cid', requireAuth, isCartOwner(), async (req, res) => {
  try {
    const cart = await cartRepository.getByIdPopulated(req.params.cid);
    if (!cart) return res.status(404).send({ status: 'error', message: 'Cart not found' });
    res.send({ status: 'success', payload: cart });
  } catch (err) {
    res.status(400).send({ status: 'error', message: err.message });
  }
});


router.post('/:cid/products/:pid',
  requireAuth,
  handlePolicies(['user']),
  isCartOwner(),
  async (req, res) => {
    try {
      const qty = Number(req.body.quantity || 1);
      await cartRepository.addItem(req.params.cid, req.params.pid, qty);
      res.status(201).send({ status: 'success' });
    } catch (err) {
      res.status(400).send({ status: 'error', message: err.message });
    }
  }
);


router.put('/:cid/products/:pid',
  requireAuth,
  handlePolicies(['user']),
  isCartOwner(),
  async (req, res) => {
    try {
      const qty = Number(req.body.quantity);
      if (!qty || qty < 1) return res.status(400).send({ status: 'error', message: 'Invalid quantity' });
      await cartRepository.updateItemQuantity(req.params.cid, req.params.pid, qty);
      res.send({ status: 'success' });
    } catch (err) {
      res.status(400).send({ status: 'error', message: err.message });
    }
  }
);


router.delete('/:cid/products/:pid',
  requireAuth,
  handlePolicies(['user']),
  isCartOwner(),
  async (req, res) => {
    try {
      await cartRepository.removeItem(req.params.cid, req.params.pid);
      res.send({ status: 'success' });
    } catch (err) {
      res.status(400).send({ status: 'error', message: err.message });
    }
  }
);


router.delete('/:cid',
  requireAuth,
  handlePolicies(['user']),
  isCartOwner(),
  async (req, res) => {
    try {
      await cartRepository.clear(req.params.cid);
      res.send({ status: 'success' });
    } catch (err) {
      res.status(400).send({ status: 'error', message: err.message });
    }
  }
);


router.post('/:cid/purchase',
  requireAuth,
  handlePolicies(['user']),
  isCartOwner(),
  async (req, res) => {
    try {
      const result = await purchaseCart(req.params.cid, req.user.email);
      res.send({ status: 'success', ...result });
    } catch (err) {
      res.status(500).send({ status: 'error', message: err.message });
    }
  }
);

export default router;
