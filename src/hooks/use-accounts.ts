"use client";

import { useCallback, useEffect, useState } from "react";

const ACCOUNTS_COOKIE_NAME = "hosenur_accounts";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  // Set cookie on root domain so it's shared across subdomains
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; domain=.hosenur.email; SameSite=Lax`;
}

function getStoredAccounts(): string[] {
  try {
    const stored = getCookie(ACCOUNTS_COOKIE_NAME);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: string[]) {
  setCookie(ACCOUNTS_COOKIE_NAME, JSON.stringify(accounts), 30);
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<string[]>([]);

  useEffect(() => {
    setAccounts(getStoredAccounts());
  }, []);

  const addAccount = useCallback((email: string) => {
    const existing = getStoredAccounts();
    const filtered = existing.filter((e) => e !== email);
    const updated = [email, ...filtered];
    saveAccounts(updated);
    setAccounts(updated);
  }, []);

  const removeAccount = useCallback((email: string) => {
    const existing = getStoredAccounts();
    const updated = existing.filter((e) => e !== email);
    saveAccounts(updated);
    setAccounts(updated);
  }, []);

  const getOtherAccounts = useCallback(
    (currentEmail: string) => {
      return accounts.filter((e) => e !== currentEmail);
    },
    [accounts],
  );

  return { accounts, addAccount, removeAccount, getOtherAccounts };
}

export function getSubdomainFromEmail(email: string): string {
  const [local] = email.split("@");
  return local;
}

export function getAccountUrl(email: string): string {
  const subdomain = getSubdomainFromEmail(email);
  return `https://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
}
