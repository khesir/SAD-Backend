export class CustomerService {
  private customers: { customer_id: number; name: string; email: string }[] =
    [];

  async getAllCustomers() {
    return this.customers;
  }

  async getCustomerById(customer_id: number) {
    return (
      this.customers.find((cust) => cust.customer_id === customer_id) || null
    );
  }

  async createCustomer(customerData: { name: string; email: string }) {
    const newCustomer = { customer_id: Date.now(), ...customerData };
    this.customers.push(newCustomer);
    return newCustomer;
  }

  async updateCustomer(
    customer_id: number,
    updateData: Partial<{ name: string; email: string }>,
  ) {
    const index = this.customers.findIndex(
      (cust) => cust.customer_id === customer_id,
    );
    if (index === -1) return null;
    this.customers[index] = { ...this.customers[index], ...updateData };
    return this.customers[index];
  }

  async deleteCustomer(customer_id: number) {
    const index = this.customers.findIndex(
      (cust) => cust.customer_id === customer_id,
    );
    if (index === -1) return false;
    this.customers.splice(index, 1);
    return true;
  }
}
