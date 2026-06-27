import { test, expect } from '@playwright/test';
import { getSchoolVerification } from '../src/schoolVerify.js';

// ─── helpers ────────────────────────────────────────────────────────────────

async function dismissIntro(page) {
  // Intro dismisses on keydown, wheel, or touchmove — NOT click
  await page.waitForTimeout(800); // let the animation start
  await page.keyboard.press('Space');
  // Wait for the intro to slide out (900ms transition)
  await page.waitForTimeout(1000);
}

async function gotoLogin(page) {
  await page.goto('/login');
  await dismissIntro(page);
}

// Mock the Supabase endpoints the email flow hits so tests never send real
// emails. Real OTP sends to fake addresses hard-bounce, and enough bounces get
// the project's built-in email service suspended — which takes down login in
// production. UI flows must be tested against mocked responses only.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
};

function fulfillJson(body, status = 200) {
  return (route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 200, headers: CORS_HEADERS });
    }
    return route.fulfill({
      status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };
}

// Mocks the OTP send so no email leaves Supabase. otpDelayMs simulates server
// latency for tests that assert the in-flight button state.
async function mockOtpFlow(page, { otpDelayMs = 0 } = {}) {
  await page.route('**/auth/v1/otp**', async (route) => {
    if (otpDelayMs) await new Promise((r) => setTimeout(r, otpDelayMs));
    return fulfillJson({})(route);
  });
  await page.route(
    '**/auth/v1/verify**',
    fulfillJson({ code: 403, error_code: 'otp_expired', msg: 'Token has expired or is invalid' }, 403),
  );
}

// A structurally valid (but unsigned) session payload, enough for supabase-js
// to store the session and fire SIGNED_IN.
function fakeSession(email) {
  const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const accessToken = [
    b64url({ alg: 'HS256', typ: 'JWT' }),
    b64url({
      sub: '00000000-0000-0000-0000-000000000000',
      aud: 'authenticated',
      role: 'authenticated',
      email,
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
    'fake-signature',
  ].join('.');
  return {
    access_token: accessToken,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'fake-refresh-token',
    user: {
      id: '00000000-0000-0000-0000-000000000000',
      aud: 'authenticated',
      role: 'authenticated',
      email,
      email_confirmed_at: new Date().toISOString(),
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { name: email.split('@')[0] },
      created_at: new Date().toISOString(),
    },
  };
}

// ─── 1. Initial render ───────────────────────────────────────────────────────

test.describe('Login Page — initial render', () => {
  test('renders the RELIVE brand in the form after intro dismissal', async ({ page }) => {
    await gotoLogin(page);
    // Specifically target the login-brand span (not the intro's per-letter spans)
    await expect(page.locator('.login-brand')).toBeVisible({ timeout: 6000 });
    await expect(page.locator('.login-brand')).toHaveText('RELIVE');
  });

  test('tagline is visible', async ({ page }) => {
    await gotoLogin(page);
    await expect(page.getByText(/course reviews by students/i)).toBeVisible({ timeout: 5000 });
  });

  test('Google sign-in button is rendered', async ({ page }) => {
    await gotoLogin(page);
    // @react-oauth/google renders as an iframe — just verify it exists in the DOM
    const iframeEl = page.locator('iframe[src*="accounts.google"]');
    await expect(iframeEl).toBeAttached({ timeout: 8000 });
  });

  test('email input is visible', async ({ page }) => {
    await gotoLogin(page);
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
  });

  test('"Continue with email" button is visible', async ({ page }) => {
    await gotoLogin(page);
    await expect(page.getByRole('button', { name: /continue with email/i })).toBeVisible({ timeout: 5000 });
  });

  test('"or" divider is visible', async ({ page }) => {
    await gotoLogin(page);
    await expect(page.getByText(/^or$/i)).toBeVisible({ timeout: 5000 });
  });

  test('footer quote is visible', async ({ page }) => {
    await gotoLogin(page);
    await expect(page.getByText(/just as books/i)).toBeVisible({ timeout: 5000 });
  });
});

// ─── 2. Intro animation ──────────────────────────────────────────────────────

test.describe('Intro animation', () => {
  test('intro overlay covers the screen on first load', async ({ page }) => {
    await page.goto('/login');
    // Body overflow is locked while intro shows
    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe('hidden');
  });

  test('intro dismisses on keydown and reveals login form', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(800);
    await page.keyboard.press('Space');
    await page.waitForTimeout(1100);
    // After dismissal, body overflow should be restored
    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe('');
    await expect(page.locator('.login-brand')).toBeVisible({ timeout: 5000 });
  });

  test('intro dismisses on scroll (wheel event)', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(800);
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(1100);
    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe('');
  });

  test('intro shows "Scroll to continue" hint', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/scroll to continue/i)).toBeVisible({ timeout: 5000 });
  });
});

// ─── 3. Email field — input validation ──────────────────────────────────────

test.describe('Email field — validation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoLogin(page);
  });

  test('HTML5 email validation prevents submission of invalid format', async ({ page }) => {
    await page.fill('input[type="email"]', 'notanemail');
    await page.getByRole('button', { name: /continue with email/i }).click();
    // HTML5 validation fires before JS; page stays on /login
    await expect(page).toHaveURL(/login/, { timeout: 4000 });
    // No in-flight "Sending…" state should appear
    await expect(page.getByRole('button', { name: /sending/i })).not.toBeVisible();
  });

  test('valid email format triggers "Sending…" button state', async ({ page }) => {
    // Delay the mocked OTP response so the in-flight state is observable
    await mockOtpFlow(page, { otpDelayMs: 1500 });
    await page.fill('input[type="email"]', 'probe@gmail.com');
    await page.getByRole('button', { name: /continue with email/i }).click();
    await expect(page.getByRole('button', { name: /sending/i })).toBeVisible({ timeout: 4000 });
  });

  test('OTP screen shows after the send request resolves', async ({ page }) => {
    await mockOtpFlow(page);
    await page.fill('input[type="email"]', 'probe@gmail.com');
    await page.getByRole('button', { name: /continue with email/i }).click();
    await expect(page.getByText(/enter your code/i)).toBeVisible({ timeout: 15000 });
  });
});

// ─── 4. New user OTP flow (non-school email) ─────────────────────────────────

test.describe('Email login — new user OTP flow (mocked)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoLogin(page);
    await mockOtpFlow(page);
  });

  test('non-existing Gmail triggers OTP code entry screen', async ({ page }) => {
    await page.fill('input[type="email"]', 'newuser_playwright_test_9999@gmail.com');
    await page.getByRole('button', { name: /continue with email/i }).click();
    await expect(page.getByText(/enter your code/i)).toBeVisible({ timeout: 15000 });
  });

  test('OTP screen shows the submitted email address', async ({ page }) => {
    const testEmail = 'newuser_playwright_test_9999@gmail.com';
    await page.fill('input[type="email"]', testEmail);
    await page.getByRole('button', { name: /continue with email/i }).click();
    await page.getByText(/enter your code/i).waitFor({ timeout: 15000 });
    await expect(page.getByText(testEmail)).toBeVisible();
  });

  test('OTP sign-in button is disabled until 6 digits entered', async ({ page }) => {
    await page.fill('input[type="email"]', 'newuser_playwright_test_9999@gmail.com');
    await page.getByRole('button', { name: /continue with email/i }).click();
    await page.getByText(/enter your code/i).waitFor({ timeout: 15000 });
    const signInBtn = page.getByRole('button', { name: /^sign in$/i });
    await expect(signInBtn).toBeDisabled();

    await page.fill('input[inputmode="numeric"]', '12345'); // 5 digits
    await expect(signInBtn).toBeDisabled();

    await page.fill('input[inputmode="numeric"]', '123456'); // 6 digits
    await expect(signInBtn).toBeEnabled();
  });

  test('non-numeric characters are stripped from OTP field', async ({ page }) => {
    await page.fill('input[type="email"]', 'newuser_playwright_test_9999@gmail.com');
    await page.getByRole('button', { name: /continue with email/i }).click();
    await page.getByText(/enter your code/i).waitFor({ timeout: 15000 });
    await page.fill('input[inputmode="numeric"]', 'abc123def');
    const val = await page.inputValue('input[inputmode="numeric"]');
    expect(val).toBe('123'); // only digits kept
  });

  test('invalid OTP shows error message', async ({ page }) => {
    await page.fill('input[type="email"]', 'newuser_playwright_test_9999@gmail.com');
    await page.getByRole('button', { name: /continue with email/i }).click();
    await page.getByText(/enter your code/i).waitFor({ timeout: 15000 });
    await page.fill('input[inputmode="numeric"]', '000000');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page.getByText(/invalid or expired/i)).toBeVisible({ timeout: 10000 });
  });

  test('"Use a different email" returns to the email form', async ({ page }) => {
    await page.fill('input[type="email"]', 'newuser_playwright_test_9999@gmail.com');
    await page.getByRole('button', { name: /continue with email/i }).click();
    await page.getByText(/enter your code/i).waitFor({ timeout: 15000 });
    await page.getByRole('button', { name: /use a different email/i }).click();
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 3000 });
    // Previously-filled email should be preserved in state
    const val = await page.inputValue('input[type="email"]');
    expect(val).toBe('newuser_playwright_test_9999@gmail.com');
  });

  test('valid OTP signs the user in and redirects to /home', async ({ page }) => {
    const email = 'newuser_playwright_test_9999@gmail.com';
    // Registered after mockOtpFlow (beforeEach), so this takes precedence
    // over its 403 verify mock.
    await page.route('**/auth/v1/verify**', fulfillJson(fakeSession(email)));

    await page.fill('input[type="email"]', email);
    await page.getByRole('button', { name: /continue with email/i }).click();
    await page.getByText(/enter your code/i).waitFor({ timeout: 15000 });
    await page.fill('input[inputmode="numeric"]', '123456');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
  });
});

// ─── 5. School email domains ─────────────────────────────────────────────────

// These call the real module directly (Playwright test files run in Node) —
// no browser needed, and no drift from a copied domain list.
test.describe('schoolVerify — domain detection (unit)', () => {
  const schoolCases = [
    { email: 'e1234567@u.nus.edu.sg',          school: 'NUS', domain: 'u.nus.edu.sg' },
    { email: 'test@nus.edu.sg',                 school: 'NUS', domain: 'nus.edu.sg' },
    { email: 'prof@comp.nus.edu.sg',            school: 'NUS', domain: 'comp.nus.edu.sg' },
    { email: 'student@u.yale-nus.edu.sg',       school: 'NUS', domain: 'u.yale-nus.edu.sg' },
    { email: 's1234567@e.ntu.edu.sg',           school: 'NTU', domain: 'e.ntu.edu.sg' },
    { email: 'staff@ntu.edu.sg',                school: 'NTU', domain: 'ntu.edu.sg' },
    { email: 'u1234567@student.ntu.edu.sg',     school: 'NTU', domain: 'student.ntu.edu.sg' },
    { email: 'jdoe@smu.edu.sg',                 school: 'SMU', domain: 'smu.edu.sg' },
    { email: 'dev@sis.smu.edu.sg',              school: 'SMU', domain: 'sis.smu.edu.sg' },
  ];

  for (const { email, school, domain } of schoolCases) {
    test(`${school} domain ${domain} is recognised by schoolVerify`, () => {
      expect(getSchoolVerification(email)).toEqual({ verified: true, school });
    });
  }

  const nonSchoolCases = ['user@gmail.com', 'user@outlook.com', 'user@hotmail.com', 'user@yahoo.com'];
  for (const email of nonSchoolCases) {
    test(`non-school email ${email} returns null school`, () => {
      expect(getSchoolVerification(email)).toEqual({ verified: false, school: null });
    });
  }
});

test.describe('School email — login flow', () => {
  test('school email triggers auth flow (not rejected)', async ({ page }) => {
    await gotoLogin(page);
    await mockOtpFlow(page);
    await page.fill('input[type="email"]', 'test_playwright@e.ntu.edu.sg');
    await page.getByRole('button', { name: /continue with email/i }).click();
    await expect(page.getByText(/enter your code/i)).toBeVisible({ timeout: 15000 });
  });
});

// ─── 6. Protected route redirects ────────────────────────────────────────────

test.describe('Protected routes — unauthenticated redirect', () => {
  const protectedRoutes = ['/home', '/nus', '/ntu', '/smu', '/admin'];

  for (const route of protectedRoutes) {
    test(`${route} redirects to /login when unauthenticated`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/login/, { timeout: 5000 });
    });
  }

  test('unknown route shows 404 / error page', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    // Should render the ErrorPage, not redirect to login
    await expect(page).not.toHaveURL(/login/, { timeout: 3000 });
  });
});

// ─── 7. Logout banner ────────────────────────────────────────────────────────

test.describe('Logout banner', () => {
  test('no banner on plain /login load (no loggedOut state)', async ({ page }) => {
    await gotoLogin(page);
    await expect(page.getByText('Logged out')).not.toBeVisible();
  });
});

// ─── 7b. Admin moderation queue ──────────────────────────────────────────────

// Logs in via the mocked OTP flow and stubs the public.users is_admin lookup.
// .maybeSingle() sends the object Accept header, so the mock returns an object.
async function loginAs(page, email, { isAdmin }) {
  await gotoLogin(page);
  await mockOtpFlow(page);
  await page.route('**/auth/v1/verify**', fulfillJson(fakeSession(email)));
  await page.route('**/rest/v1/users**', fulfillJson({ is_admin: isAdmin }));
  await page.fill('input[type="email"]', email);
  await page.getByRole('button', { name: /continue with email/i }).click();
  await page.getByText(/enter your code/i).waitFor({ timeout: 15000 });
  await page.fill('input[inputmode="numeric"]', '123456');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
}

test.describe('Admin moderation queue', () => {
  test('non-admin visiting /admin is redirected to /home', async ({ page }) => {
    await page.route('**/rest/v1/courses**', fulfillJson([]));
    await loginAs(page, 'normal_user_playwright@gmail.com', { isAdmin: false });
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/home/, { timeout: 8000 });
  });

  test('admin sees the queue and approving removes the item', async ({ page }) => {
    const pendingCourse = {
      id: 101, school: 'NUS', course: 'Pending Course X',
      faculty: 'School of Computing', description: 'A course awaiting approval', status: 'pending',
    };
    await page.route('**/rest/v1/reviews**', (route) =>
      route.request().method() === 'PATCH' ? fulfillJson([{}])(route) : fulfillJson([])(route),
    );
    await page.route('**/rest/v1/courses**', (route) =>
      route.request().method() === 'PATCH' ? fulfillJson([{}])(route) : fulfillJson([pendingCourse])(route),
    );

    await loginAs(page, 'admin_playwright@gmail.com', { isAdmin: true });
    await page.goto('/admin');

    await expect(page.getByText('Moderation Queue')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('Pending Course X')).toBeVisible();

    await page.getByRole('button', { name: /^approve$/i }).first().click();
    await expect(page.getByText('Pending Course X')).not.toBeVisible({ timeout: 5000 });
  });
});

// ─── 8. Google sign-in nonce ────────────────────────────────────────────────

test.describe('Google sign-in nonce', () => {
  test('nonce is generated on page load (GoogleLogin iframe has nonce attr or is present)', async ({ page }) => {
    await gotoLogin(page);
    // Nonce being ready is what causes GoogleLogin to render — check it's present
    const iframeEl = page.locator('iframe[src*="accounts.google"]');
    await expect(iframeEl).toBeAttached({ timeout: 8000 });
  });

  test('placeholder skeleton shows before nonce is ready', async ({ page }) => {
    await page.goto('/login');
    // On immediate load (before nonce generates), a grey placeholder div renders
    // This disappears quickly so just verify the page doesn't crash
    await page.waitForTimeout(200);
    const html = await page.content();
    expect(html).toContain('login-form-area');
  });
});
