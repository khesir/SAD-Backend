import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, asc, desc, eq, isNull, sql } from 'drizzle-orm';
import { SchemaType } from '@/drizzle/schema/type';
import { serviceLog } from '@/drizzle/schema/records/schema/serviceLog';
import { employee } from '@/drizzle/schema/ems';

export class ServiceLogService {
  private db: PostgresJsDatabase<SchemaType>;

  constructor(db: PostgresJsDatabase<SchemaType>) {
    this.db = db;
  }

  async createServiceLog(data: object) {
    await this.db.insert(serviceLog).values(data);
  }

  async getAllServiceLog(
    service_id: string | undefined,
    no_pagination: boolean,
    sort: string,
    limit: number,
    offset: number,
  ) {
    const conditions = [isNull(serviceLog.deleted_at)];

    if (service_id) {
      conditions.push(eq(serviceLog.service_id, Number(service_id)));
    }
    const totalCountQuery = await this.db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(serviceLog)
      .where(and(...conditions));

    const totalData = totalCountQuery[0].count;

    const query = this.db
      .select()
      .from(serviceLog)
      .leftJoin(employee, eq(employee.employee_id, serviceLog.performed_by))
      .where(and(...conditions))
      .orderBy(
        sort === 'asc'
          ? asc(serviceLog.created_at)
          : desc(serviceLog.created_at),
      );

    if (!no_pagination) {
      query.limit(limit).offset(offset);
    }

    const result = await query;

    const servicelogWithDetails = result.map((row) => ({
      ...row.serviceLog,
      performed_by: row.employee,
    }));

    return { totalData, servicelogWithDetails };
  }
}
