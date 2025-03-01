import request from 'supertest';
import express from 'express';
import customerRoute from '../../__tests__/customer/customermock.route';

const app = express();
app.use(express.json());
app.use('/customer', customerRoute);

describe('Customer API (In-Memory)', () => {
  let customerId: number;

  it('should create a new customer', async () => {
    const res = await request(app)
      .post('/customer')
      .send({ name: 'John Doe', email: 'john@example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('customer_id');
    customerId = res.body.customer_id;
  });

  it('should get all customers', async () => {
    const res = await request(app).get('/customer');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a customer by ID', async () => {
    const res = await request(app).get(`/customer/${customerId}`);
    expect(res.status).toBe(200);
    expect(res.body.customer_id).toBe(customerId);
  });

  it('should update a customer', async () => {
    const res = await request(app)
      .put(`/customer/${customerId}`)
      .send({ name: 'Jane Doe' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Jane Doe');
  });

  it('should delete a customer', async () => {
    const res = await request(app).delete(`/customer/${customerId}`);
    expect(res.status).toBe(204);
  });

  it('should return 404 for a deleted customer', async () => {
    const res = await request(app).get(`/customer/${customerId}`);
    expect(res.status).toBe(404);
  });
});
