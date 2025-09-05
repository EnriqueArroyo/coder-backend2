import UserDAO from '../dao/user.dao.js';
import ProductDAO from '../dao/product.dao.js';
import CartDAO from '../dao/cart.dao.js';
import TicketDAO from '../dao/ticket.dao.js';

import UserRepository from './user.repository.js';
import ProductRepository from './product.repository.js';
import CartRepository from './cart.repository.js';
import TicketRepository from './ticket.repository.js';

export const userRepository   = new UserRepository(new UserDAO());
export const productRepository = new ProductRepository(new ProductDAO());
export const cartRepository    = new CartRepository(new CartDAO());
export const ticketRepository  = new TicketRepository(new TicketDAO());
