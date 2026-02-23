import { NextResponse } from 'next/server';
import {
  deleteCartIdCookie,
  deleteEffAccountIdCookie,
  deletePortalUserIdCookie,
  deleteUserLocaleCookie,
  deleteUserNameCookie,
  updateIsGuestUserToDefaultInCookie,
} from 'app/api/auth/cookieUtils';

export async function POST() {
  await deletePortalUserIdCookie();
  await deleteEffAccountIdCookie();
  await deleteCartIdCookie();
  await deleteUserLocaleCookie();
  await deleteUserNameCookie();
  await updateIsGuestUserToDefaultInCookie();
  return NextResponse.json({ success: true }, { status: 200 });
}
