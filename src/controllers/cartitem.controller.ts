import client from '../db/db.js';
import { Request, Response } from 'express';

export const getAllCartItems = async (req: Request, res: Response) => {
  const cartId = +req.params.id;
  if (!cartId) {
    return res.status(400).json({ status: 'fail', message: 'Invalid cart ID' });
  }
  try {
    const query = `
    SELECT cart_items.* , products.name AS product_name, products.price AS product_price FROM cart_items
    JOIN carts ON carts.id = cart_items.cart_id AND carts.user_id = $2
    JOIN products ON products.id = cart_items.product_id
    WHERE cart_items.cart_id = $1
    `;
    const cartItems = await client.query(query, [cartId, req.user?.id]);

    if (!cartItems.rows.length) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'No cart items found' });
    }

    res.status(200).json({ status: 'success', data: cartItems.rows });
  } catch (err: any) {
    console.error('Error fetching cart items: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

export const createCartItem = async (req: Request, res: Response) => {
  const cartId = +req.params.id;
  if (!cartId) {
    return res.status(400).json({ status: 'fail', message: 'Invalid cart ID' });
  }
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Missing product ID or quantity' });
    }

    const cartCheck = await client.query(
      'SELECT * FROM carts WHERE id = $1 AND user_id = $2',
      [cartId, req.user?.id]
    );
    console.log('Cart ID:', cartId, '<User ID:', req.user?.id, '>');
    if (!cartCheck.rows.length) {
      return res
        .status(404)
        .json({ status: 'fail', message: "Cart not found or isn't yours" });
    }

    const query = `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const newCartItem = await client.query(query, [
      cartId,
      productId,
      quantity,
    ]);

    res.status(201).json({ status: 'success', data: newCartItem.rows[0] });
  } catch (err: any) {
    if (err.message.includes('foreign')) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Product not found' });
    }
    console.error('Error creating cart item: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

export const getCartItem = async (req: Request, res: Response) => {
  const itemId = +req.params.id;

  if (!itemId) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Invalid cart item ID' });
  }

  try {
    const checkQuery = `
        SELECT cart_items.*, products.name AS product_name, products.price AS product_price
        FROM cart_items 
        JOIN carts on carts.id = cart_items.cart_id AND carts.user_id = $2
        JOIN products ON products.id = cart_items.product_id
        WHERE cart_items.id = $1
        `;
    const cartItem = await client.query(checkQuery, [itemId, req.user?.id]);

    if (cartItem.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: "Cart item not found or isn't yours",
      });
    }

    res.status(200).json({ status: 'success', data: cartItem.rows[0] });
  } catch (err) {
    console.error('Error fetching cart item: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  const itemId = +req.params.id;

  if (!itemId) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Invalid cart item ID' });
  }

  try {
    const { quantity } = req.body;
    if (!quantity || typeof quantity !== 'number') {
      //invalidate 0 quantity
      return res
        .status(400)
        .json({ status: 'fail', message: 'Missing or invalid quantity' });
    }

    const checkQuery = `
        SELECT cart_items.* 
        FROM cart_items 
        JOIN carts on carts.id = cart_items.cart_id AND carts.user_id = $2
        WHERE cart_items.id = $1
        `;
    const cartItem = await client.query(checkQuery, [itemId, req.user?.id]);

    if (cartItem.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: "Cart item not found or isn't yours",
      });
    }

    const updateQuery = `
        UPDATE cart_items
        SET quantity = $1
        WHERE id = $2
        RETURNING *
    `;
    const updatedCartItem = await client.query(updateQuery, [quantity, itemId]);

    res.status(200).json({ status: 'success', data: updatedCartItem.rows[0] });
  } catch (err: any) {
    if (err.message.includes('foreign')) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Product not found' });
    }
    if (err.message.includes('unique')) {
      return res.status(400).json({
        status: 'fail',
        message: 'This product already exists in the cart. Modify it instead',
      });
    }
    console.error('Error updating cart item: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};
