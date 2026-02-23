import {
  IS_GUEST_USER_COOKIE_NAME,
  SFDC_EFF_ACCOUNT_ID_COOKIE_NAME,
  SFDC_PORTAL_USER_ID_COOKIE_NAME,
  SFDC_USER_LOCALE_COOKIE_NAME,
  SFDC_USER_NAME_COOKIE_NAME,
} from 'lib/constants';
import { loginPortalUser } from 'app/api/auth/authUtil';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles portal user login:
 * 1. Authenticates via OAuth Username-Password flow on the community URL.
 * 2. Retrieves the user's Salesforce User ID and Account ID.
 * 3. Stores them in httpOnly cookies for server-side ccrz-context injection.
 */
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const userInfo = await loginPortalUser(username, password);
    if (!userInfo) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
    };

    res.cookies.set({ name: SFDC_PORTAL_USER_ID_COOKIE_NAME, value: userInfo.userId, ...cookieOptions });
    res.cookies.set({ name: SFDC_EFF_ACCOUNT_ID_COOKIE_NAME, value: userInfo.accountId, ...cookieOptions });
    res.cookies.set({ name: SFDC_USER_LOCALE_COOKIE_NAME, value: userInfo.userLocale, ...cookieOptions });
    res.cookies.set({ name: SFDC_USER_NAME_COOKIE_NAME, value: userInfo.userName, ...cookieOptions });
    res.cookies.set({
      name: IS_GUEST_USER_COOKIE_NAME,
      value: JSON.stringify(false),
      ...cookieOptions,
    });
    res.headers.set('x-guest-user', JSON.stringify(false));

    return res;
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected error', details: String(error) }, { status: 500 });
  }
}
