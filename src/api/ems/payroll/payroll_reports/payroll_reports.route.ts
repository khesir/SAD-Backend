import { Router } from 'express';

import { db } from '../../../../../mysql/mysql.pool';
import log from '../../../../../lib/logger';
import { PayReportsController } from './payroll_reports.controller';

const payrollreportRoute = Router({ mergeParams: true });
const payreportsController = new PayReportsController(db);

payrollreportRoute.post(
  '/',
  payreportsController.createPayRoll.bind(payreportsController),
);
log.info('Post /reports');

export default payrollreportRoute;
