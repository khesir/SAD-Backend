const customers = [
  {
    id: 1,
    firstname: 'Michael',
    middlename: '',
    lastname: '',
    contact: '',
    email: '',
    socials: '',
    addressline: '',
    barangay: '',
    province: '',
    standing: '',
    customer_group: '',
  },
  {
    id: 2,
    firstname: 'Jane',
    middlename: '',
    lastname: '',
    contact: '',
    email: '',
    socials: '',
    addressline: '',
    barangay: '',
    province: '',
    standing: '',
    customer_group: '',
  },
];

import { Request, Response, NextFunction } from 'express';

export const validateCustomerID = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const customerId = Number(req.params.customer_id);
  if (!customers.some((c) => c.id === customerId)) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  next();
};
