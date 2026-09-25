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

  test('adding items updates the cart badge', async ({ loggedIn }) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await expect(loggedIn.cartBadge).toHaveText('1');
    await loggedIn.addToCart('Sauce Labs Bike Light');
    await expect(loggedIn.cartBadge).toHaveText('2');
  });

  test('completes checkout end to end', async ({ page, loggedIn, checkoutPage }) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await loggedIn.openCart();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.getByTestId('inventory-item')).toHaveCount(1);
    await expect(page.getByTestId('inventory-item')).toContainText('Sauce Labs Backpack');

    await checkoutPage.checkoutButton.click();
    await checkoutPage.fillInfo('Test', 'User', '12345');
    await checkoutPage.finishButton.click();

    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });
});
