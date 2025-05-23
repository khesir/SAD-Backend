import {
  and,
  eq,
  isNull,
  sql,
  asc,
  desc,
  SQL,
  inArray,
  like,
  InferSelectModel,
  gt,
} from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { SupabaseService } from '@/supabase/supabase.service';
import { SchemaType } from '@/drizzle/schema/type';
import { CreateProduct, UpdateProduct } from './product.model';
import {
  productDetails,
  product,
  category,
  supplier,
  productRecord,
  serializeProduct,
  orderProduct,
  order,
} from '@/drizzle/schema/ims';
import { productCategory } from '@/drizzle/schema/ims/schema/product/productCategory.schema';
import { productSupplier } from '@/drizzle/schema/ims/schema/product/productSupplier.schema';
import { ProductLog } from '@/drizzle/schema/records';
import { employee } from '@/drizzle/schema/ems';
import { employeeLog } from '@/drizzle/schema/records/schema/employeeLog';

export class ProductService {
  private db: PostgresJsDatabase<SchemaType>;
  private supabaseService: SupabaseService;

  constructor(db: PostgresJsDatabase<SchemaType>) {
    this.db = db;
    this.supabaseService = SupabaseService.getInstance();
  }

  async createProduct(
    data: CreateProduct,
    file: Express.Multer.File | undefined,
  ) {
    return this.db.transaction(async (tx) => {
      // Create file
      let filepath = undefined;
      if (file) {
        filepath = await this.supabaseService.uploadImageToBucket(file);
      }
      // Product Creation
      const [newProduct] = await tx
        .insert(product)
        .values({
          ...data,
          img_url: filepath,
          selling_price: data.selling_price.toString(),
        })
        .returning({ product_id: product.product_id });
      await tx
        .insert(productDetails)
        .values({
          ...data.product_details,
          product_id: newProduct.product_id,
        })
        .returning({ p_details_id: productDetails.p_details_id });
      // Category Generation
      if (data.product_categories && data.product_categories.length > 0) {
        const categoriesToInsert = data.product_categories.map((category) => ({
          product_id: newProduct.product_id,
          category_id: category.category_id,
        }));

        await tx.insert(productCategory).values(categoriesToInsert);
      }
      // Logging Data
      const empData = await tx
        .select()
        .from(employee)
        .where(eq(employee.employee_id, data.user));
      await tx.insert(ProductLog).values({
        product_id: newProduct.product_id,
        performed_by: empData[0].employee_id,
        action: `${empData[0].firstname} ${empData[0].lastname} created product`,
      });
      await tx.insert(employeeLog).values({
        employee_id: empData[0].employee_id,
        performed_by: empData[0].employee_id,
        action: `${empData[0].firstname} ${empData[0].lastname} created product`,
      });
    });
  }
  async updateProduct(
    data: UpdateProduct,
    file: Express.Multer.File | undefined,
    paramsId: number,
  ) {
    return this.db.transaction(async (tx) => {
      // Update Existing product data
      try {
        await tx
          .update(product)
          .set({ ...data, selling_price: data.selling_price.toString() })
          .where(eq(product.product_id, paramsId));
        const exisiting_data_product = await tx
          .select()
          .from(productDetails)
          .where(eq(productDetails.product_id, paramsId));
        if (exisiting_data_product.length > 0) {
          await tx
            .update(productDetails)
            .set({ ...data.product_details })
            .where(eq(productDetails.product_id, paramsId));
        } else {
          await tx
            .insert(productDetails)
            .values({ product_id: paramsId, ...data.product_details });
        }
        // Updating Categories
        const categories = await tx
          .select()
          .from(productCategory)
          .leftJoin(
            category,
            eq(category.category_id, productCategory.category_id),
          )
          .where(
            and(
              isNull(productCategory.deleted_at),
              eq(productCategory.product_id, paramsId),
            ),
          );

        const categoryByProduct = new Map<
          number,
          {
            product_category: InferSelectModel<typeof productCategory>;
            category: InferSelectModel<typeof category> | null;
          }[]
        >();

        categories.forEach(({ product_category, category }) => {
          const productID = product_category.product_id;
          if (productID !== null) {
            if (!categoryByProduct.has(productID)) {
              categoryByProduct.set(productID, []);
            }
            categoryByProduct.get(productID)!.push({
              product_category,
              category: category
                ? {
                    category_id: category.category_id,
                    name: category.name ?? null,
                    created_at: category.created_at ?? null,
                    last_updated: category.last_updated ?? new Date(),
                    deleted_at: category.deleted_at ?? null,
                  }
                : null,
            });
          }
        });

        const existingCategoryIds = new Set(
          categories?.map(
            ({ category }: { category: { category_id: number } | null }) =>
              category?.category_id,
          ) ?? [],
        );

        const newCategoryIds = new Set<number>(
          data.product_categories?.map((c) => c.category_id) ?? [],
        );

        const categoriesToDelete: number[] = [...existingCategoryIds]
          .filter((id): id is number => id !== undefined)
          .filter((id) => !newCategoryIds.has(id));

        const categoriesToAdd: number[] = [...newCategoryIds]
          .filter((id): id is number => id !== undefined)
          .filter((id) => !existingCategoryIds.has(id));

        if (categoriesToDelete.length > 0) {
          await tx
            .delete(productCategory)
            .where(
              and(
                eq(productCategory.product_id, paramsId),
                inArray(productCategory.category_id, categoriesToDelete),
              ),
            );
        }

        // Insert new categories
        if (categoriesToAdd.length > 0) {
          await tx.insert(productCategory).values(
            categoriesToAdd.map((category_id) => ({
              product_id: paramsId,
              category_id,
            })),
          );
        }

        if (file) {
          const filepath = await this.supabaseService.uploadImageToBucket(file);

          await tx
            .update(product)
            .set({
              img_url: filepath,
              name: data.name,
              is_serialize: data.is_serialize,
              status: data.status,
            })
            .where(eq(product.product_id, paramsId));
        } else {
          await tx
            .update(product)
            .set({
              name: data.name,
              is_serialize: data.is_serialize,
              status: data.status,
            })
            .where(eq(product.product_id, paramsId));
        }
        const empData = await tx
          .select()
          .from(employee)
          .where(eq(employee.employee_id, data.user));
        await tx.insert(ProductLog).values({
          product_id: paramsId,
          action: `${empData[0].firstname} ${empData[0].lastname} updated product`,
          performed_by: empData[0].employee_id,
        });
        await tx.insert(employeeLog).values({
          employee_id: empData[0].employee_id,
          performed_by: empData[0].employee_id,
          action: `${empData[0].firstname} ${empData[0].lastname} created product`,
        });
      } catch (error) {
        console.error('Error in updateProduct transaction:', error);
        throw error; // Ensure transaction rollback on failure
      }
    });
  }

  async deleteProduct(paramsId: number): Promise<void> {
    await this.db
      .update(product)
      .set({ deleted_at: new Date(Date.now()) })
      .where(eq(product.product_id, paramsId));
  }

  async getAllProduct(
    sort: string,
    limit: number,
    offset: number,
    product_name: string | undefined,
    category_id: number | undefined,
    status: string | undefined,
    is_rent: boolean,
    is_service: boolean,
    no_pagination: boolean,
  ) {
    const conditions = [isNull(product.deleted_at)];
    if (product_name) {
      conditions.push(like(product.name, `%${product_name}%`));
    }
    if (status) {
      conditions.push(
        eq(
          product.status,
          status as 'Unavailable' | 'Available' | 'Discontinued',
        ),
      );
      if (is_rent) {
        conditions.push(gt(product.rent_quantity, 0));
      }
      if (is_service) {
        conditions.push(gt(product.service_quantity, 0));
      }
    }
    const query = this.db
      .select()
      .from(product)
      .leftJoin(
        productDetails,
        eq(productDetails.product_id, product.product_id),
      )
      .where(and(...conditions))
      .orderBy(
        sort == 'asc' ? desc(product.product_id) : asc(product.product_id),
      );
    if (!no_pagination) {
      query.limit(limit).offset(offset);
    }
    const result = await query;
    const productIds = result.map((p) => p.product.product_id);
    const recordByProduct = await this.getRecordByProduct(productIds);
    const serialByProduct = await this.getSerializedByProduct(productIds);
    const totalData = await this.getTotalDataByCondition(conditions);
    const categoryByProduct = await this.getCategoryByProduct();
    const supplierByProduct = await this.getSupplierbyProduct();
    const orderByProduct = await this.getOrderByProduct();

    const productWithDetails = result
      .filter((row) => {
        // Applied category filter
        const categories = categoryByProduct.get(row.product.product_id) || [];

        if (category_id) {
          return categories.some(
            (category: unknown) =>
              (category as { category_id: number }).category_id === category_id,
          );
        }

        return true;
      })
      .map((row) => ({
        ...row.product,
        product_details: {
          ...row.product_details,
        },
        product_records: recordByProduct.get(row.product.product_id) || [],
        product_serials: serialByProduct.get(row.product.product_id) || [],
        product_categories: categoryByProduct.get(row.product.product_id) || [],
        product_suppliers: supplierByProduct.get(row.product.product_id) || [],
        product_orders: orderByProduct.get(row.product.product_id) || [],
      }));

    return { totalData, productWithDetails };
  }

  async getProductById(product_id: number) {
    const result = await this.db
      .select()
      .from(product)
      .leftJoin(
        productDetails,
        eq(productDetails.product_id, product.product_id),
      )
      .where(eq(product.product_id, Number(product_id)));
    const productIds = result.map((p) => p.product.product_id);
    const recordByProduct = await this.getRecordByProduct(productIds);
    const serialByProduct = await this.getSerializedByProduct(productIds);
    const categoryByProduct = await this.getCategoryByProduct();
    const supplierByProduct = await this.getSupplierbyProduct();
    const orderByProduct = await this.getOrderByProduct();
    const productWithDetails = result.map((row) => ({
      ...row.product,
      product_details: {
        ...row.product_details,
      },
      product_records: recordByProduct.get(row.product.product_id) || [],
      product_serials: serialByProduct.get(row.product.product_id) || [],
      product_categories: categoryByProduct.get(row.product.product_id) || [],
      product_suppliers: supplierByProduct.get(row.product.product_id) || [],
      product_orders: orderByProduct.get(row.product.product_id) || [],
    }));

    return productWithDetails;
  }

  private async getTotalDataByCondition(
    conditions: SQL<unknown>[],
  ): Promise<number> {
    const totalCountQuery = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(product)
      .where(and(...conditions));

    return totalCountQuery[0].count;
  }
  private async getSupplierbyProduct(): Promise<Map<number, unknown[]>> {
    const result = await this.db
      .select()
      .from(productSupplier)
      .leftJoin(supplier, eq(supplier.supplier_id, productSupplier.supplier_id))
      .where(isNull(productSupplier.deleted_at));

    const supplierByProduct = new Map<number, unknown[]>();

    result.forEach(({ product_supplier, supplier }) => {
      const productID = product_supplier.product_id;
      if (productID !== null) {
        if (!supplierByProduct.has(productID)) {
          supplierByProduct.set(productID, []);
        }
        supplierByProduct
          .get(productID)!
          .push({ ...product_supplier, supplier: { ...supplier } });
      }
    });
    return supplierByProduct;
  }

  private async getCategoryByProduct(
    product_id: number | undefined = undefined,
  ): Promise<
    Map<
      number,
      {
        product_category: InferSelectModel<typeof productCategory>;
        category: InferSelectModel<typeof category> | null;
      }[]
    >
  > {
    const conditions = [isNull(productCategory.deleted_at)];

    if (product_id !== undefined) {
      conditions.push(eq(productCategory.product_id, product_id));
    }
    const result = await this.db
      .select()
      .from(productCategory)
      .leftJoin(category, eq(category.category_id, productCategory.category_id))
      .where(and(...conditions));

    const categoryByProduct = new Map<
      number,
      {
        product_category: InferSelectModel<typeof productCategory>;
        category: InferSelectModel<typeof category> | null;
      }[]
    >();

    result.forEach(({ product_category, category }) => {
      const productID = product_category.product_id;
      if (productID !== null) {
        if (!categoryByProduct.has(productID)) {
          categoryByProduct.set(productID, []);
        }
        categoryByProduct.get(productID)!.push({
          product_category,
          category: category
            ? {
                category_id: category.category_id,
                name: category.name ?? null, // Ensure no undefined values
                created_at: category.created_at ?? null,
                last_updated: category.last_updated ?? new Date(),
                deleted_at: category.deleted_at ?? null,
              }
            : null,
        });
      }
    });

    return categoryByProduct;
  }

  private async getOrderByProduct(): Promise<Map<number, unknown[]>> {
    const result = await this.db
      .select()
      .from(orderProduct)
      .leftJoin(order, eq(order.order_id, orderProduct.order_id))
      .where(isNull(orderProduct.deleted_at));

    const orderByProduct = new Map<number, unknown[]>();

    result.forEach(({ order_product, order }) => {
      const productID = order_product.product_id;
      if (productID !== null) {
        if (!orderByProduct.has(productID)) {
          orderByProduct.set(productID, []);
        }
        orderByProduct
          .get(productID)!
          .push({ ...order_product, order: { ...order } });
      }
    });

    return orderByProduct;
  }

  private async getRecordByProduct(
    productIDs: number[],
  ): Promise<Map<number, unknown[]>> {
    const result = await this.db
      .select()
      .from(productRecord)
      .where(inArray(productRecord.product_id, productIDs));

    const productRecordsByProduct = new Map<number, unknown[]>();

    result.forEach((record) => {
      const productID = record.product_id!;
      if (!productRecordsByProduct.has(productID)) {
        productRecordsByProduct.set(productID, []);
      }
      productRecordsByProduct.get(productID)!.push(record);
    });
    return productRecordsByProduct;
  }
  private async getSerializedByProduct(
    productIDs: number[],
  ): Promise<Map<number, unknown[]>> {
    const result = await this.db
      .select()
      .from(serializeProduct)
      .where(inArray(serializeProduct.product_id, productIDs));

    const productSerialByProduct = new Map<number, unknown[]>();

    result.forEach((record) => {
      const productID = record.product_id!;

      if (!productSerialByProduct.has(productID)) {
        productSerialByProduct.set(productID, []);
      }
      productSerialByProduct.get(productID)!.push(record);
    });
    return productSerialByProduct;
  }
}
