import { Request, Response, NextFunction } from 'express';

import { MySql2Database } from 'drizzle-orm/mysql2/driver';
import { HttpStatus } from '../../../../../lib/config';
import { PayReportsService } from './pay_reports.service';

export class PayReportsController {
  private payreportsService: PayReportsService;

  constructor(pool: MySql2Database) {
    this.payreportsService = new PayReportsService(pool);
  }

  async createPayRoll(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        on_payroll_id,
        netpay,
        grosspay,
        total_deductions,
        total_benefits,
      } = req.body;

      await this.payreportsService.createPayReports({
        on_payroll_id,
        netpay,
        grosspay,
        total_deductions,
        total_benefits,
      });
      res
        .status(HttpStatus.CREATED.code)
        .json({ message: 'Payroll Reports Created' });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).json({
        message: 'Internal Server Error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR.code,
      });
      next(error);
    }
  }
}
