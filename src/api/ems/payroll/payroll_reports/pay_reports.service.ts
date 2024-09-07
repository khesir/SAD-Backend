import { MySql2Database } from 'drizzle-orm/mysql2/driver';
import { payrollReports } from '../../../../../drizzle/drizzle.schema';

export class PayReportsService {
  private db: MySql2Database;

  constructor(db: MySql2Database) {
    this.db = db;
  }

  async createPayReports(data: object) {
    await this.db.insert(payrollReports).values(data);
  }
}
