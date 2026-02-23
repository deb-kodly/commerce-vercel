import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { CookieOptions, defaultCookieOptions } from './sfdc/types';
import {
  CART_ID_COOKIE_NAME,
  GUEST_COOKIE_AGE,
  IS_GUEST_USER_COOKIE_NAME,
  SFDC_EFF_ACCOUNT_ID_COOKIE_NAME,
  SFDC_PORTAL_USER_ID_COOKIE_NAME,
  SFDC_USER_LOCALE_COOKIE_NAME,
  SFDC_USER_NAME_COOKIE_NAME,
} from './constants';

export class ServerCookieManager {
  private static instance: ServerCookieManager;
  private request?: NextRequest;

  private constructor(request?: NextRequest) {
    this.request = request;
  }

  public static getInstance(request?: NextRequest): ServerCookieManager {
    if (!ServerCookieManager.instance || request) {
      ServerCookieManager.instance = new ServerCookieManager(request);
    }
    return ServerCookieManager.instance;
  }

  private async getServerCookies() {
    try {
      return cookies();
    } catch {
      return null;
    }
  }

  private async getCookieValue(name: string): Promise<string | null> {
    if (this.request) {
      return this.request.cookies.get(name)?.value || null;
    }
    const serverCookies = await this.getServerCookies();
    return serverCookies?.get(name)?.value || null;
  }

  private async setCookieValue(name: string, value: string, options: CookieOptions = {}) {
    const opts = { ...defaultCookieOptions, ...options };
    if (this.request) {
      this.request.cookies.set({ name, value, ...opts });
    } else {
      const serverCookies = await this.getServerCookies();
      if (serverCookies) {
        serverCookies.set({ name, value, ...opts });
      }
    }
  }

  private async deleteCookieValue(name: string) {
    if (this.request) {
      this.request.cookies.delete(name);
    } else {
      const serverCookies = await this.getServerCookies();
      if (serverCookies) {
        serverCookies.delete(name);
      }
    }
  }

  // Guest User Methods
  async getIsGuestUser(): Promise<boolean | null> {
    const cookie = await this.getCookieValue(IS_GUEST_USER_COOKIE_NAME);
    if (!cookie) return null;
    try {
      return JSON.parse(cookie);
    } catch {
      return null;
    }
  }

  async setIsGuestUser(isGuest: boolean, options: CookieOptions = {}) {
    await this.setCookieValue(IS_GUEST_USER_COOKIE_NAME, JSON.stringify(isGuest), options);
  }

  // Portal User ID Methods
  async getPortalUserId(): Promise<string | null> {
    return this.getCookieValue(SFDC_PORTAL_USER_ID_COOKIE_NAME);
  }

  async setPortalUserId(userId: string, options: CookieOptions = {}) {
    await this.setCookieValue(SFDC_PORTAL_USER_ID_COOKIE_NAME, userId, options);
  }

  async deletePortalUserId() {
    await this.deleteCookieValue(SFDC_PORTAL_USER_ID_COOKIE_NAME);
  }

  // Effective Account ID Methods
  async getEffAccountId(): Promise<string | null> {
    return this.getCookieValue(SFDC_EFF_ACCOUNT_ID_COOKIE_NAME);
  }

  async setEffAccountId(accountId: string, options: CookieOptions = {}) {
    await this.setCookieValue(SFDC_EFF_ACCOUNT_ID_COOKIE_NAME, accountId, options);
  }

  async deleteEffAccountId() {
    await this.deleteCookieValue(SFDC_EFF_ACCOUNT_ID_COOKIE_NAME);
  }

  // Cart Methods
  async getCartId(): Promise<string | null> {
    return this.getCookieValue(CART_ID_COOKIE_NAME);
  }

  async setCartId(cartId: string, options: CookieOptions = {}) {
    await this.setCookieValue(CART_ID_COOKIE_NAME, cartId, options);
  }

  async deleteCartId() {
    await this.deleteCookieValue(CART_ID_COOKIE_NAME);
  }

  // User Locale Methods
  async getUserLocale(): Promise<string | null> {
    return this.getCookieValue(SFDC_USER_LOCALE_COOKIE_NAME);
  }

  async setUserLocale(userLocale: string, options: CookieOptions = {}) {
    await this.setCookieValue(SFDC_USER_LOCALE_COOKIE_NAME, userLocale, options);
  }

  async deleteUserLocale() {
    await this.deleteCookieValue(SFDC_USER_LOCALE_COOKIE_NAME);
  }

  // User Name Methods
  async getUserName(): Promise<string | null> {
    return this.getCookieValue(SFDC_USER_NAME_COOKIE_NAME);
  }

  async setUserName(userName: string, options: CookieOptions = {}) {
    await this.setCookieValue(SFDC_USER_NAME_COOKIE_NAME, userName, options);
  }

  async deleteUserName() {
    await this.deleteCookieValue(SFDC_USER_NAME_COOKIE_NAME);
  }

  public async getCookie(name: string): Promise<string | undefined> {
    const value = await this.getCookieValue(name);
    return value ?? undefined;
  }
}

export async function getCookie(name: string): Promise<string | undefined> {
  return ServerCookieManager.getInstance().getCookie(name);
}
