"use client";

import { useCallback, useEffect, useState } from "react";

interface Account {
  email: string;
  name: string;
  lastLoginAt: string;
}

const ACCOUNTS_KEY = "hosenur_accounts";

function getStoredAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Account[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    setAccounts(getStoredAccounts());
  }, []);

  const addAccount = useCallback((email: string, name: string) => {
    const existing = getStoredAccounts();
    const filtered = existing.filter((a) => a.email !== email);
    const updated = [
      { email, name, lastLoginAt: new Date().toISOString() },
      ...filtered,
    ];
    saveAccounts(updated);
    setAccounts(updated);
  }, []);

  const removeAccount = useCallback((email: string) => {
    const existing = getStoredAccounts();
    const updated = existing.filter((a) => a.email !== email);
    saveAccounts(updated);
    setAccounts(updated);
  }, []);

  const getOtherAccounts = useCallback(
    (currentEmail: string) => {
      return accounts.filter((a) => a.email !== currentEmail);
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
  return `https://${subdomain}.hosenur.email`;
}
