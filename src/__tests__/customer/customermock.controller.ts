import { Request, Response } from 'express';

export class CustomerController {
  customers: { customer_id: number; name: string; email: string }[] = [];

  getAllCustomers(req: Request, res: Response) {
    res.json(this.customers);
  }

  getCustomerById(req: Request, res: Response) {
    const customer = this.customers.find(
      (c) => c.customer_id == Number(req.params.customer_id),
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  }

  createCustomer(req: Request, res: Response) {
    const newCustomer = { customer_id: this.customers.length + 1, ...req.body };
    this.customers.push(newCustomer);
    res.status(201).json(newCustomer);
  }

  updateCustomer(req: Request, res: Response) {
    const customer = this.customers.find(
      (c) => c.customer_id == Number(req.params.customer_id),
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    Object.assign(customer, req.body);
    res.json(customer);
  }

  deleteCustomer(req: Request, res: Response) {
    const index = this.customers.findIndex(
      (c) => c.customer_id == Number(req.params.customer_id),
    );
    if (index === -1)
      return res.status(404).json({ error: 'Customer not found' });
    this.customers.splice(index, 1);
    res.status(204).send();
  }
}
