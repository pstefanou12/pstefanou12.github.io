/**
 * @fileoverview Smoke test of the deployed shape: the homepage, the MMA page
 * and the docs at /delphi/ with their navigation, search and theme.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {expect, test} from '@playwright/test';

test('the static pages are still served', async ({request}) => {
  expect((await request.get('/')).ok()).toBe(true);
  expect((await request.get('/mma/mma.html')).ok()).toBe(true);
});

test('the docs land on their index with a card per part', async ({page}) => {
  await page.goto('/delphi/');
  await expect(page.getByRole('heading', {level: 1})).toHaveText(
    'delphi.ai documentation',
  );
  await expect(page.locator('.card').first()).toBeVisible();
});

test('a model page renders its API reference', async ({page}) => {
  await page.goto('/delphi/#/truncated-exponential');
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Exponential');
  await expect(page.locator('#api-reference')).toBeVisible();
  await expect(page.locator('.katex').first()).toBeVisible();
});

test('search finds a model by its class name', async ({page, isMobile}) => {
  test.skip(isMobile, 'The search box collapses to an icon on phones.');
  await page.goto('/delphi/');
  await page.getByRole('searchbox').fill('TruncatedPoisson');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/truncated-poisson$/);
});

test('the theme toggle switches to light and is remembered', async ({page}) => {
  await page.goto('/delphi/');
  await page.getByRole('button', {name: 'Switch to light theme'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('the mobile drawer lists every part', async ({page, isMobile}) => {
  test.skip(!isMobile, 'The drawer exists only on narrow screens.');
  await page.goto('/delphi/#/truncated-exponential');
  await page.getByRole('button', {name: 'Open navigation'}).click();
  // The navbar's tabs are hidden on phones but still list every part.
  const parts = await page.locator('.part-tab').count();
  expect(parts).toBeGreaterThan(1);
  await expect(page.locator('.sidebar.open .toc-part-title')).toHaveCount(
    parts,
  );
});
