import { HttpStatus } from '@/lib/HttpStatus';
import { Request, Response, NextFunction } from 'express';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { SchemaType } from '@/drizzle/schema/type';
import { ServicesService } from './service.service';

export class ServiceController {
  private servicesService: ServicesService;

  constructor(pool: PostgresJsDatabase<SchemaType>) {
    this.servicesService = new ServicesService(pool);
  }

  async getAllServices(req: Request, res: Response, next: NextFunction) {
    const service_type_id = req.params.service_type_id as string;
    const no_pagination = req.query.no_pagination === 'true';
    const sort = (req.query.sort as string) || 'asc';
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const joborder_service_only = req.query.joborder_service_only === 'true';
    const joborder_id = (req.params.joborder_id as string) || undefined;
    try {
      const data = await this.servicesService.getAllServices(
        service_type_id,
        joborder_service_only,
        joborder_id,
        no_pagination,
        sort,
        limit,
        offset,
      );
      res.status(HttpStatus.OK.code).json({
        status: 'Success',
        message: 'Data Retrieved Successfully',
        total_data: data.totalData,
        limit: limit,
        offset: offset,
        data: data.serviceWithDetails,
      });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .json({ message: 'Internal Server Error ' });
      next(error);
    }
  }

  async getServiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { service_id } = req.params;
      const data = await this.servicesService.getServiceById(
        Number(service_id),
      );
      res.status(200).json({ status: 'Success', data: data });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .json({ message: 'Internal Server Error ' });
      next(error);
    }
  }

  async createServices(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        service_type_id,
        uuid,
        fee,
        customer_id,
        service_status,
        total_cost_price,
        user_id,
        assigned,
        joborder_id,
      } = req.body;
      const data = await this.servicesService.createServices({
        service_type_id,
        uuid,
        fee,
        customer_id,
        service_status,
        total_cost_price,
        user_id,
        assigned,
        joborder_id,
      });
      res.status(200).json({ status: 'Success', data: data });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).json({
        status: 'Error ',
        message: 'Internal Server Error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR.code,
      });
      next(error);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const { service_id } = req.params;
      const {
        service_type_id,
        uuid,
        fee,
        customer_id,
        service_status,
        total_price_cost,
        joborder_id,
      } = req.body;

      await this.servicesService.updateService(
        {
          service_type_id,
          uuid,
          fee,
          customer_id,
          service_status,
          total_price_cost,
          joborder_id,
        },
        Number(service_id),
      );
      res.status(HttpStatus.OK.code).json({
        status: 'Success',
        message: 'Service Updated Successfully ',
      });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .json({ status: 'Error', message: 'Internal Server Error ' });
      next(error);
    }
  }

  async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      const { service_id } = req.params;
      await this.servicesService.deleteService(Number(service_id));
      res.status(200).json({
        status: 'Success',
        message: `Service ID:${service_id} is deleted Successfully`,
      });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .json({ status: 'Error', message: 'Internal Server Error' });
      next(error);
    }
  }
}
