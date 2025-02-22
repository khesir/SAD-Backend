import {
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const supplierRelation = pgEnum('supplierRelation_Status', [
  'manufacturer',
  'distributor',
  'wholesaler',
  'vendor',
  'authorized dealer',
  'OEM (Original Equipment Manufacturer)',
  'peripheral supplier',
  'component reseller',
  'refurbished parts supplier',
  'specialized parts supplier',
  'network hardware supplier',
  'value-added reseller',
  'accessories supplier',
  'logistics partner',
]);

export const supplier = pgTable('supplier', {
  supplier_id: serial('supplier_id').primaryKey(),
  company_name: varchar('company_name', { length: 255 }),
  contact_number: varchar('contact_number', { length: 255 }),
  remarks: varchar('remarks', { length: 255 }),
  relationship: supplierRelation('relationship'),
  profile_link: varchar('profile_link'),
  created_at: timestamp('created_at').defaultNow(),
  last_updated: timestamp('last_updated')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deleted_at: timestamp('deleted_at'),
});
