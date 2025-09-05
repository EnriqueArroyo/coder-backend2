import { Router } from 'express';
import { requireAuth, handlePolicies } from '../middlewares/auth.js';
import { productRepository } from '../repositories/index.js';

const router = Router();


router.get('/', async (req, res) => {
  try {
    const products = await productRepository.list();
    res.send({ status: 'success', payload: products });
  } catch (err) {
    res.status(500).send({ status: 'error', message: err.message });
  }
});


router.get('/:pid', async (req, res) => {
  try {
    const product = await productRepository.getById(req.params.pid);
    if (!product) return res.status(404).send({ status: 'error', message: 'Not found' });
    res.send({ status: 'success', payload: product });
  } catch (err) {
    res.status(400).send({ status: 'error', message: err.message });
  }
});


router.post('/', requireAuth, handlePolicies(['admin']), async (req, res) => {
  try {
    const created = await productRepository.create(req.body);
    res.status(201).send({ status: 'success', payload: created });
  } catch (err) {
    res.status(400).send({ status: 'error', message: err.message });
  }
});


router.put('/:pid', requireAuth, handlePolicies(['admin']), async (req, res) => {
  try {
    const updated = await productRepository.update(req.params.pid, req.body);
    if (!updated) return res.status(404).send({ status: 'error', message: 'Not found' });
    res.send({ status: 'success', payload: updated });
  } catch (err) {
    res.status(400).send({ status: 'error', message: err.message });
  }
});


router.delete('/:pid', requireAuth, handlePolicies(['admin']), async (req, res) => {
  try {
    const deleted = await productRepository.delete(req.params.pid);
    if (!deleted) return res.status(404).send({ status: 'error', message: 'Not found' });
    res.send({ status: 'success', payload: deleted });
  } catch (err) {
    res.status(400).send({ status: 'error', message: err.message });
  }
});

export default router;
