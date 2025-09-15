export type RecipientType = 'email' | 'phone' | 'username';
export interface RecentRecipientItem {
  id: string;
  name: string;
  avatar?: string;
  contact: string; // email | phone | username value
  type: RecipientType;
  lastAmount?: number;
  lastSentAt?: string; // ISO date
  frequency?: number;
}

const STORAGE_KEY = 'recentRecipients.v1';

function read(): RecentRecipientItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function write(items: RecentRecipientItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 10)));
  } catch {}
}

export const recentRecipientsService = {
  getAll(): RecentRecipientItem[] {
    return read();
  },
  addOrPromote(item: RecentRecipientItem) {
    const list = read();
    const idx = list.findIndex(r => r.contact === item.contact && r.type === item.type);
    if (idx >= 0) {
      const existing = list[idx];
      const updated: RecentRecipientItem = {
        ...existing,
        ...item,
        frequency: (existing.frequency || 0) + 1,
        lastSentAt: item.lastSentAt || new Date().toISOString(),
      };
      list.splice(idx, 1);
      list.unshift(updated);
    } else {
      list.unshift({ ...item, frequency: item.frequency ?? 1, lastSentAt: item.lastSentAt || new Date().toISOString() });
    }
    write(list);
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
