import {
  integer,
  pgEnum,
  pgTable,
  real,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { jobOrderType } from './jobOrderType.schema';
import { customer } from '../../../../../drizzle/schema/customer';

export const jobOrderStatusEnum = pgEnum('joborder_status', [
  'Pending',
  'In Progress',
  'Completed',
  'On Hold',
  'Cancelled',
  'Awaiting Approval',
  'Approved',
  'Rejected',
  'Closed',
]);

export const jobOrder = pgTable('job_order', {
  job_order_id: serial('job_order_id').primaryKey(),
  job_order_type_id: integer('joborder_type_id').references(
    () => jobOrderType.joborder_type_id,
  ),
  customer_id: integer('customer_id').references(() => customer.customer_id),
  uuid: varchar('uuid', { length: 255 }),
  description: varchar('description'),
  fee: integer('fee'),
  joborder_status: jobOrderStatusEnum('joborder_status').notNull(),
  total_cost_price: real('total_cost_price'),
  created_at: timestamp('created_at').defaultNow(),
  last_updated: timestamp('last_updated')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deleted_at: timestamp('deleted_at'),
});
