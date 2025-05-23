import { HttpStatus } from '@/lib/HttpStatus';
import { Request, Response, NextFunction } from 'express';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { SchemaType } from '@/drizzle/schema/type';
import { TicketTypeService } from './tickettype.service';

export class TicketTypesController {
  private tickettypeService: TicketTypeService;

  constructor(pool: PostgresJsDatabase<SchemaType>) {
    this.tickettypeService = new TicketTypeService(pool);
  }

  async getAllTicketTypes(req: Request, res: Response, next: NextFunction) {
    try {
      // Fetch data count from the database
      const data = await this.tickettypeService.getAllTicketType();
      res.status(HttpStatus.OK.code).json({
        status: 'Success',
        data: data,
      });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .json({ message: 'Internal Server Error ' });
      next(error);
    }
  }

  async getTicketTypesById(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticket_type_id } = req.params;
      const data = await this.tickettypeService.getTicketTypeById(
        Number(ticket_type_id),
      );
      res.status(200).json({ status: 'Success', data: data });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .json({ message: 'Internal Server Error ' });
      next(error);
    }
  }

  async createTicketTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;

      await this.tickettypeService.createTicketType({
        name,
        description,
      });
      res.status(HttpStatus.CREATED.code).json({
        status: 'Success',
        message: 'Successfully Created Ticket Type ',
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

  async updateTicketTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticket_type_id } = req.params;
      const { name, description } = req.body;

      await this.tickettypeService.updateTicketType(
        { name, description },
        Number(ticket_type_id),
      );
      res.status(HttpStatus.OK.code).json({
        status: 'Success',
        message: 'Ticket Type Updated Successfully ',
      });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .json({ status: 'Error', message: 'Internal Server Error ' });
      next(error);
    }
  }

  async deleteTicketTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticket_type_id } = req.params;
      await this.tickettypeService.deleteTicketType(Number(ticket_type_id));
      res.status(200).json({
        status: 'Success',
        message: `Ticket Type ID:${ticket_type_id} is deleted Successfully`,
      });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .json({ status: 'Error', message: 'Internal Server Error' });
      next(error);
    }
  }
}
