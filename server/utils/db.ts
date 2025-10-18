import { logger } from './logger.js';

// Simple database utility that simulates database operations
// In a real implementation, this would use drizzle-orm or another database library

interface DatabaseRecord {
  id: string;
  [key: string]: any;
}

class SimpleDatabase {
  private tables: { [key: string]: DatabaseRecord[] } = {};

  constructor() {
    // Initialize tables
    this.tables['crypto_wallets'] = [];
    this.tables['crypto_transactions'] = [];
    this.tables['crypto_trades'] = [];
    this.tables['crypto_prices'] = [];
  }

  async insert(tableName: string, data: any): Promise<any[]> {
    if (!this.tables[tableName]) {
      this.tables[tableName] = [];
    }

    const record = { ...data, id: data.id || `id_${Date.now()}_${Math.random()}` };
    this.tables[tableName].push(record);
    logger.info(`Inserted record into ${tableName}`, { id: record.id });
    return [record];
  }

  async select(tableName: string, whereClause?: (record: DatabaseRecord) => boolean): Promise<any[]> {
    const table = this.tables[tableName] || [];
    if (whereClause) {
      return table.filter(whereClause);
    }
    return [...table];
  }

  async update(tableName: string, whereClause: (record: DatabaseRecord) => boolean, updates: any): Promise<void> {
    const table = this.tables[tableName] || [];
    for (const record of table) {
      if (whereClause(record)) {
        Object.assign(record, updates, { updated_at: new Date() });
        logger.info(`Updated record in ${tableName}`, { id: record.id });
      }
    }
  }

  async delete(tableName: string, whereClause: (record: DatabaseRecord) => boolean): Promise<void> {
    const table = this.tables[tableName] || [];
    this.tables[tableName] = table.filter(record => !whereClause(record));
    logger.info(`Deleted records from ${tableName}`);
  }
}

// Export a singleton instance
export const db = new SimpleDatabase();

logger.info('Simple database utility initialized');