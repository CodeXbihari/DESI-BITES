import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addCartItem, setCartQuantity, calculateCartEstimate, normalizeCoupon, canReviewCheckout } from '../src/services/cart.ts';

// Synthetic fixtures only; these do not add items to the application's catalogue.
const grocery = { id: 'p_fixture', name: 'Fixture', price: 99, image: '' };
const food = { id: 'sm_fixture', name: 'Fixture', price: 120, image: '' };

test('cart operations synchronize matching IDs without merging similarly named items', () => {
  let cart = addCartItem([], grocery);
  cart = addCartItem(cart, food);
  cart = addCartItem(cart, { ...food });
  assert.equal(cart.length, 2);
  assert.equal(cart[1].quantity, 2);
  assert.equal(calculateCartEstimate(cart, null, 'delivery').count, 3);
  cart = setCartQuantity(cart, food.id, 4);
  assert.equal(cart[1].quantity, 4);
  assert.equal(calculateCartEstimate(cart, null, 'delivery').subtotalPaise, 57900);
  cart = setCartQuantity(cart, food.id, 0);
  assert.deepEqual(cart, [{ product: grocery, quantity: 1 }]);
  assert.equal(calculateCartEstimate(cart, null, 'delivery').totalPaise, 13400);
  assert.equal(setCartQuantity(cart, grocery.id, NaN), cart);
  assert.equal(setCartQuantity(cart, grocery.id, 1.5), cart);
});

test('delivery threshold uses subtotal and pickup never adds a delivery fee', () => {
  for (const [price, expected] of [[498, 3500], [499, 0], [500, 0]]) {
    const cart = addCartItem([], { ...grocery, price });
    assert.equal(calculateCartEstimate(cart, null, 'delivery').deliveryFeePaise, expected);
    assert.equal(calculateCartEstimate(cart, null, 'pickup').deliveryFeePaise, 0);
  }
  const cart = addCartItem([], grocery);
  assert.equal(calculateCartEstimate(cart, 'DESIEXPRESS', 'delivery').totalPaise, 9900);
});

test('shared coupon policy preserves whole-rupee discount rounding and removal', () => {
  const cart = addCartItem([], grocery);
  assert.equal(normalizeCoupon(' festive40 '), 'FESTIVE40');
  assert.equal(normalizeCoupon('desi50'), null);
  assert.equal(calculateCartEstimate(cart, 'FESTIVE40', 'delivery').discountPaise, 4000);
  assert.equal(calculateCartEstimate(cart, 'SPICE20', 'delivery').discountPaise, 2000);
  assert.equal(calculateCartEstimate(cart, null, 'delivery').discountPaise, 0);
  const freeDelivery = addCartItem([], { ...grocery, price: 499 });
  assert.equal(calculateCartEstimate(freeDelivery, 'FESTIVE40', 'delivery').deliveryFeePaise, 0);
});

test('fractional rupee item prices are accumulated in integer paise', () => {
  const cart = [
    { product: { ...grocery, price: 0.1 }, quantity: 3 },
    { product: { ...food, price: 0.2 }, quantity: 1 },
  ];
  const estimate = calculateCartEstimate(cart, null, 'pickup');
  assert.equal(estimate.subtotalPaise, 50);
  assert.equal(estimate.totalPaise, 50);
});

test('empty carts have zero estimates for every coupon and fulfillment option', () => {
  for (const coupon of [null, 'FESTIVE40', 'SPICE20', 'DESIEXPRESS']) {
    for (const mode of ['pickup', 'delivery']) {
      assert.deepEqual(calculateCartEstimate([], coupon, mode), {
        count: 0, subtotalPaise: 0, discountPaise: 0, deliveryFeePaise: 0, totalPaise: 0,
      });
    }
  }
});

test('checkout review requires items and an entered address only for delivery', () => {
  const cart = addCartItem([], food);
  assert.equal(canReviewCheckout(cart, 'delivery', ''), false);
  assert.equal(canReviewCheckout(cart, 'delivery', ' \n '), false);
  assert.equal(canReviewCheckout(cart, 'delivery', 'Synthetic test address'), true);
  assert.equal(canReviewCheckout(cart, 'pickup', ''), true);
  assert.equal(canReviewCheckout([], 'pickup', ''), false);
  assert.equal(canReviewCheckout([], 'delivery', 'Synthetic test address'), false);
});
