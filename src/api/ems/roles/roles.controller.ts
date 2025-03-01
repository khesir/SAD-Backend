import { HttpStatus } from '../../../../lib/HttpStatus';
import { Request, Response, NextFunction } from 'express';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { EmployeeRoleService } from './roles.service';
import { SchemaType } from '../../../../drizzle/schema/type';

export class EmployeeRoleController {
  private employeeroleService: EmployeeRoleService;

  constructor(pool: PostgresJsDatabase<SchemaType>) {
    this.employeeroleService = new EmployeeRoleService(pool);
  }

  async getAllEmployeeRole(req: Request, res: Response, next: NextFunction) {
    const limit = parseInt(req.query.limit as string) || 10; // default limit value
    const offset = parseInt(req.query.offset as string) || 0; // default offset value
    try {
      // Fetch data count from the database
      const data = await this.employeeroleService.getAllEmployeeRole(
        limit,
        offset,
      );
      res.status(HttpStatus.OK.code).json({
        status: 'Success',
        message: 'Data retrieved successfully',
        total_data: data.length,
        limit: limit,
        offset: offset,
        data: data,
      });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .json({ message: 'Internal Server Error ' });
      next(error);
    }
  }

  async getEmployeeRoleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles_id } = req.params;
      const data = await this.employeeroleService.getEmployeeRoleById(
        Number(roles_id),
      );
      res.status(200).json({ status: 'Success', message: data });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .json({ message: 'Internal Server Error ' });
      next(error);
    }
  }

  async createEmployeeRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;

      await this.employeeroleService.createEmployeeRole({
        name,
      });
      res.status(HttpStatus.CREATED.code).json({
        status: 'Success',
        message: 'Successfully Created Employee Role ',
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).json({
        status: 'Error ',
        message: 'Internal Server Error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR.code,
      });
      next(error);
    }
  }

  async updateEmployeeRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles_id } = req.params;
      const { name } = req.body;

      await this.employeeroleService.updateEmployeeRole(
        { name },
        Number(roles_id),
      );
      res.status(HttpStatus.OK.code).json({
        status: 'Success',
        message: 'Employee Role Updated Successfully ',
      });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .json({ status: 'Error', message: 'Internal Server Error ' });
      next(error);
    }
  }

  async deleteEmployeeRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles_id } = req.params;
      await this.employeeroleService.deleteEmployeeRole(Number(roles_id));
      res.status(200).json({
        status: 'Success',
        message: `Role ID:${roles_id} is deleted Successfully`,
      });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .json({ status: 'Error', message: 'Internal Server Error' });
      next(error);
    }
  }
}
