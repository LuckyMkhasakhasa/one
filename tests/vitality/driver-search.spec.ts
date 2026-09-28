import { test, expect, DRIVER } from '../../src/vitalityFixtures';

test.describe('Driver search', () => {
  test.beforeEach(async ({ loggedIn }) => {
    await loggedIn.selectSearchType('Driver');
  });

  test('shows the driver search fields', async ({ searchPage }) => {
    for (const field of [
      searchPage.planReference,
      searchPage.firstName,
      searchPage.lastName,
      searchPage.mobileNumber,
      searchPage.email,
      searchPage.entityReference,
    ]) {
      await expect(field).toBeVisible();
    }
  });

  test('finds a driver by name and entity reference', async ({ searchPage }) => {
    await searchPage.firstName.fill(DRIVER.firstName);
    await searchPage.lastName.fill(DRIVER.lastName);
    await searchPage.entityReference.fill(DRIVER.entityReference);
    await searchPage.submitButton.click();

    await expect(searchPage.results).toHaveCount(1);
    const row = searchPage.result(DRIVER.entityReference);
    await expect(row).toContainText(DRIVER.planReference);
    await expect(row).toContainText(`${DRIVER.firstName} ${DRIVER.lastName}`);
    await expect(row).toContainText('01/10/2023');
    await expect(row).toContainText('30/09/2030');
  });

  test('finds a driver by entity reference alone', async ({ searchPage }) => {
    await searchPage.entityReference.fill(DRIVER.entityReference);
    await searchPage.submitButton.click();
    await expect(searchPage.result(DRIVER.entityReference)).toBeVisible();
  });

  test('finds a driver by first and last name', async ({ searchPage }) => {
    await searchPage.firstName.fill(DRIVER.firstName);
    await searchPage.lastName.fill(DRIVER.lastName);
    await searchPage.submitButton.click();
    await expect(searchPage.result(DRIVER.entityReference)).toBeVisible();
  });

  test('finds a driver by plan reference', async ({ searchPage }) => {
    await searchPage.planReference.fill(DRIVER.planReference);
    await searchPage.submitButton.click();
    await expect(searchPage.result(DRIVER.entityReference)).toBeVisible();
  });

  test('shows a message when nothing matches', async ({ searchPage }) => {
    await searchPage.entityReference.fill('ENOMATCH000000');
    await searchPage.submitButton.click();
    await expect(searchPage.message('No search results found, please try again.')).toBeVisible();
    await expect(searchPage.results).toHaveCount(0);
  });

  test('requires at least one search parameter', async ({ searchPage }) => {
    await searchPage.submitButton.click();
    await expect(searchPage.message('Please provide at least one search parameter')).toBeVisible();
  });

  test('clear empties the search fields', async ({ searchPage }) => {
    await searchPage.firstName.fill(DRIVER.firstName);
    await searchPage.entityReference.fill(DRIVER.entityReference);
    await searchPage.clearButton.click();
    await expect(searchPage.firstName).toHaveValue('');
    await expect(searchPage.entityReference).toHaveValue('');
  });
});

test.describe('Driver information', () => {
  test('opens the driver details from the search results', async ({ loggedIn, driverInfoPage }) => {
    await loggedIn.selectSearchType('Driver');
    await loggedIn.entityReference.fill(DRIVER.entityReference);
    await loggedIn.submitButton.click();
    await loggedIn.openEntity(DRIVER.entityReference);

    await expect(driverInfoPage.heading).toBeVisible();
    await expect(driverInfoPage.field('First name')).toHaveText(DRIVER.firstName);
    await expect(driverInfoPage.field('Last name')).toHaveText(DRIVER.lastName);
    await expect(driverInfoPage.field('Entity reference')).toHaveText(DRIVER.entityReference);
    await expect(driverInfoPage.field('Entity role')).toHaveText('Fleet Driver');
    await expect(driverInfoPage.planList).toContainText(DRIVER.planReference);
  });
});
