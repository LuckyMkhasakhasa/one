import { test, expect } from '../../src/fixtures';

test.describe('Shopping', () => {
  test('inventory lists products', async ({ loggedIn }) => {
    await expect(loggedIn.items).toHaveCount(6);
  });

  test('sorts products by price low to high', async ({ loggedIn }) => {
    await loggedIn.sortBy('lohi');
    const prices = await loggedIn.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts products by price high to low', async ({ loggedIn }) => {
    await loggedIn.sortBy('hilo');
    const prices = await loggedIn.prices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('sorts products by name A to Z by default', async ({ loggedIn }) => {
    const names = await loggedIn.names();
    expect(names).toEqual([...names].sort());
  });

  test('sorts products by name Z to A', async ({ loggedIn }) => {
    await loggedIn.sortBy('za');
    const names = await loggedIn.names();
    expect(names).toEqual([...names].sort().reverse());
  });

  test('adding items updates the cart badge', async ({ loggedIn }) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await expect(loggedIn.cartBadge).toHaveText('1');
    await loggedIn.addToCart('Sauce Labs Bike Light');
    await expect(loggedIn.cartBadge).toHaveText('2');
  });

  test('removing an item from inventory updates the cart badge', async ({ loggedIn }) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await loggedIn.addToCart('Sauce Labs Bike Light');
    await loggedIn.removeFromCart('Sauce Labs Backpack');
    await expect(loggedIn.cartBadge).toHaveText('1');
    await loggedIn.removeFromCart('Sauce Labs Bike Light');
    await expect(loggedIn.cartBadge).toBeHidden();
  });

  test('reset app state empties the cart', async ({ loggedIn }) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await expect(loggedIn.cartBadge).toHaveText('1');
    await loggedIn.resetAppState();
    await expect(loggedIn.cartBadge).toBeHidden();
  });

  test('cart persists across a page reload', async ({ page, loggedIn }) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await page.reload();
    await expect(loggedIn.cartBadge).toHaveText('1');
  });
});

test.describe('Product details', () => {
  test('shows the same name and price as the inventory', async ({ page, loggedIn, productPage }) => {
    const item = loggedIn.item('Sauce Labs Backpack');
    const price = await item.getByTestId('inventory-item-price').textContent();

    await loggedIn.openItem('Sauce Labs Backpack');
    await expect(page).toHaveURL(/inventory-item\.html\?id=\d+/);
    await expect(productPage.name).toHaveText('Sauce Labs Backpack');
    await expect(productPage.price).toHaveText(price!);
  });

  test('can add and remove the item from the detail page', async ({ loggedIn, productPage }) => {
    await loggedIn.openItem('Sauce Labs Backpack');
    await productPage.addToCartButton.click();
    await expect(loggedIn.cartBadge).toHaveText('1');
    await productPage.removeButton.click();
    await expect(loggedIn.cartBadge).toBeHidden();
  });

  test('back button returns to the inventory', async ({ page, loggedIn, productPage }) => {
    await loggedIn.openItem('Sauce Labs Backpack');
    await productPage.backButton.click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(loggedIn.items).toHaveCount(6);
  });
});

test.describe('Cart', () => {
  test('lists added items and can remove them', async ({ loggedIn, cartPage }) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await loggedIn.addToCart('Sauce Labs Bike Light');
    await loggedIn.openCart();

    await expect(cartPage.items).toHaveCount(2);
    await cartPage.remove('Sauce Labs Backpack');
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.item('Sauce Labs Bike Light')).toBeVisible();
    await expect(loggedIn.cartBadge).toHaveText('1');
  });

  test('continue shopping returns to the inventory', async ({ page, loggedIn, cartPage }) => {
    await loggedIn.openCart();
    await expect(cartPage.items).toHaveCount(0);
    await cartPage.continueShoppingButton.click();
    await expect(page).toHaveURL(/inventory\.html/);
  });
});

test.describe('Checkout', () => {
  test('completes checkout end to end', async ({ page, loggedIn, cartPage, checkoutPage }) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await loggedIn.openCart();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.items).toContainText('Sauce Labs Backpack');

    await cartPage.checkoutButton.click();
    await checkoutPage.fillInfo('Test', 'User', '12345');
    await checkoutPage.finishButton.click();

    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(loggedIn.cartBadge).toBeHidden();

    await checkoutPage.backHomeButton.click();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('overview totals add up', async ({ loggedIn, cartPage, checkoutPage }) => {
    const names = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Onesie'];
    for (const name of names) await loggedIn.addToCart(name);
    const expectedSubtotal = (await Promise.all(
      names.map(async (n) => Number((await loggedIn.item(n).getByTestId('inventory-item-price').textContent())!.replace('$', ''))),
    )).reduce((a, b) => a + b, 0);

    await loggedIn.openCart();
    await cartPage.checkoutButton.click();
    await checkoutPage.fillInfo('Test', 'User', '12345');

    const subtotal = await checkoutPage.amount(checkoutPage.subtotal);
    const tax = await checkoutPage.amount(checkoutPage.tax);
    const total = await checkoutPage.amount(checkoutPage.total);
    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(tax).toBeGreaterThan(0);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  const missingFields = [
    { missing: 'first name', first: '', last: 'User', zip: '12345', error: 'First Name is required' },
    { missing: 'last name', first: 'Test', last: '', zip: '12345', error: 'Last Name is required' },
    { missing: 'postal code', first: 'Test', last: 'User', zip: '', error: 'Postal Code is required' },
  ];

  for (const { missing, first, last, zip, error } of missingFields) {
    test(`requires ${missing}`, async ({ page, loggedIn, cartPage, checkoutPage }) => {
      await loggedIn.addToCart('Sauce Labs Backpack');
      await loggedIn.openCart();
      await cartPage.checkoutButton.click();
      await checkoutPage.fillInfo(first, last, zip);
      await expect(checkoutPage.error).toContainText(error);
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
  }

  test('cancel on the info step returns to the cart', async ({ page, loggedIn, cartPage, checkoutPage }) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await loggedIn.openCart();
    await cartPage.checkoutButton.click();
    await checkoutPage.cancelButton.click();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.items).toHaveCount(1);
  });

  test('cancel on the overview returns to the inventory and keeps the cart', async ({ page, loggedIn, cartPage, checkoutPage }) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await loggedIn.openCart();
    await cartPage.checkoutButton.click();
    await checkoutPage.fillInfo('Test', 'User', '12345');
    await checkoutPage.cancelButton.click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(loggedIn.cartBadge).toHaveText('1');
  });
});
