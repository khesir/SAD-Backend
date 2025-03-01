import { Router } from 'express';
import log from '../../../lib/logger';
import { CustomerController } from '../../../src/__tests__/customer/customermock.controller';
import { validateCustomerID } from '../../../src/__tests__/customer/customermock.middleware';

const customerRoute = Router({ mergeParams: true });
const customerController = new CustomerController(); // No DB, in-memory instead

customerRoute.get(
  '/',
  customerController.getAllCustomers.bind(customerController),
);
log.info('GET /customer set');

customerRoute.get(
  '/:customer_id',
  validateCustomerID,
  customerController.getCustomerById.bind(customerController),
);
log.info('GET /customer/:customer_id set');

customerRoute.post(
  '/',
  customerController.createCustomer.bind(customerController),
);
log.info('POST /customer/ set ');

customerRoute.put(
  '/:customer_id',
  customerController.updateCustomer.bind(customerController),
);
log.info('PUT /customer/:customer_id set ');

customerRoute.delete(
  '/:customer_id',
  validateCustomerID,
  customerController.deleteCustomer.bind(customerController),
);
log.info('DELETE /customer/:customer_id set');

// customerRoute.use(
//   ':customer_id/customergroup',
//   validateCustomerID,
//   customergroupRoute,
// );

export default customerRoute;
