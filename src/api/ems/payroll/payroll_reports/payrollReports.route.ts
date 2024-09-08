import { Router } from 'express';

import { db } from '../../../../../mysql/mysql.pool';
import log from '../../../../../lib/logger';
import { PayrollReportsController } from './payrollReports.controller';

const payrollReportRoute = Router({ mergeParams: true });
const payrollReportsController = new PayrollReportsController(db);

payrollReportRoute.post(
  '/',
  payrollReportsController.createPayrollReports.bind(payrollReportsController),
);
log.info('Post /reports');

export default payrollReportRoute;
