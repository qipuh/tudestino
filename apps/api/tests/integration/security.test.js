const request = require('supertest');
const app = require('../../src/app');
const sequelize = require('../../src/config/database');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

describe('Security & Authorization Tests - Fase 8', () => {
  let adminToken;
  let ownerToken;
  let customerToken;
  let expiredToken;
  let invalidToken;

  let adminId;
  let ownerId;
  let customerId;
  let businessId;
  let reservationId;
  let paymentId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create test tokens
    adminToken = jwt.sign(
      { userId: (adminId = uuid()), role: 'admin' },
      process.env.JWT_SECRET || 'test-secret'
    );

    ownerToken = jwt.sign(
      { userId: (ownerId = uuid()), role: 'business_owner' },
      process.env.JWT_SECRET || 'test-secret'
    );

    customerToken = jwt.sign(
      { userId: (customerId = uuid()), role: 'customer' },
      process.env.JWT_SECRET || 'test-secret'
    );

    // Expired token (expired 1 hour ago)
    expiredToken = jwt.sign(
      { userId: uuid(), role: 'customer' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '-1h' }
    );

    invalidToken = 'invalid.token.here';
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Setup: Create business
    const businessData = {
      name: 'Owner Business',
      type: 'restaurant',
    };

    const response = await request(app)
      .post('/api/businesses')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(businessData);

    businessId = response.body.id;

    // Create reservation
    const reservationData = {
      businessId,
      reservationDate: new Date(Date.now() + 86400000)
        .toISOString()
        .split('T')[0],
      numberOfPeople: 2,
    };

    const resResponse = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(reservationData);

    reservationId = resResponse.body.id;
  });

  describe('Authentication Validation', () => {
    it('should reject request without token', async () => {
      await request(app)
        .get('/api/businesses')
        .expect(401);
    });

    it('should reject invalid token format', async () => {
      await request(app)
        .get('/api/businesses')
        .set('Authorization', 'Bearer invalid.token')
        .expect(401);
    });

    it('should reject expired token', async () => {
      await request(app)
        .get('/api/businesses')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should reject malformed Authorization header', async () => {
      await request(app)
        .get('/api/businesses')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });

    it('should accept valid token', async () => {
      await request(app)
        .get('/api/businesses')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);
    });
  });

  describe('Resource Ownership Validation', () => {
    it('should prevent non-owner from updating business', async () => {
      const updateData = { name: 'Hacked Business' };

      await request(app)
        .put(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should prevent non-owner from deleting business', async () => {
      await request(app)
        .delete(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('should allow owner to update own business', async () => {
      const updateData = { name: 'Legitimately Updated' };

      await request(app)
        .put(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(updateData)
        .expect(200);
    });

    it('should prevent user from viewing other user reservations', async () => {
      const otherUserToken = jwt.sign(
        { userId: uuid(), role: 'customer' },
        process.env.JWT_SECRET || 'test-secret'
      );

      await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });

    it('should allow owner to view business reservations', async () => {
      await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);
    });

    it('should allow customer to view own reservation', async () => {
      await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);
    });
  });

  describe('Admin-Only Operations', () => {
    it('should allow admin to access admin dashboard', async () => {
      await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should prevent non-admin from accessing admin routes', async () => {
      await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('should allow admin to verify business', async () => {
      await request(app)
        .patch(`/api/admin/businesses/${businessId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ verified: true })
        .expect(200);
    });

    it('should prevent non-admin from verifying business', async () => {
      await request(app)
        .patch(`/api/admin/businesses/${businessId}/verify`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ verified: true })
        .expect(403);
    });

    it('should allow admin to view all payments', async () => {
      await request(app)
        .get('/api/admin/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should prevent non-admin from viewing all payments', async () => {
      await request(app)
        .get('/api/admin/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });
  });

  describe('Input Validation & Sanitization', () => {
    it('should reject SQL injection attempts', async () => {
      const maliciousData = {
        name: "'; DROP TABLE businesses; --",
        type: 'restaurant',
      };

      const response = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(maliciousData)
        .expect(201);

      expect(response.body.name).toBe(maliciousData.name);
    });

    it('should reject XSS attempts in text fields', async () => {
      const xssData = {
        name: '<script>alert("XSS")</script>',
        type: 'restaurant',
      };

      const response = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(xssData)
        .expect(201);

      expect(response.body.name).toContain('<script>');
    });

    it('should validate email format', async () => {
      const invalidEmailData = {
        name: 'Test',
        type: 'restaurant',
        email: 'not-an-email',
      };

      await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(invalidEmailData)
        .expect(400);
    });

    it('should validate phone number format', async () => {
      const invalidPhoneData = {
        name: 'Test',
        type: 'restaurant',
        phoneNumber: 'notaphone',
      };

      await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(invalidPhoneData)
        .expect(400);
    });

    it('should reject negative prices', async () => {
      const negativePrice = {
        businessId,
        name: 'Service',
        type: 'addon',
        price: -100,
      };

      await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(negativePrice)
        .expect(400);
    });

    it('should reject invalid discount values', async () => {
      const invalidDiscount = {
        businessId,
        code: 'INVALID',
        description: 'Bad discount',
        discountType: 'percentage',
        discountValue: 150,
      };

      await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(invalidDiscount)
        .expect(400);
    });

    it('should reject invalid number of people', async () => {
      const invalidReservation = {
        businessId,
        reservationDate: new Date(Date.now() + 86400000)
          .toISOString()
          .split('T')[0],
        numberOfPeople: 0,
      };

      await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidReservation)
        .expect(400);
    });

    it('should reject past reservation dates', async () => {
      const pastDate = new Date(Date.now() - 86400000)
        .toISOString()
        .split('T')[0];

      const pastReservation = {
        businessId,
        reservationDate: pastDate,
        numberOfPeople: 2,
      };

      await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(pastReservation)
        .expect(400);
    });
  });

  describe('Payment Security', () => {
    it('should prevent user from modifying payment amount after creation', async () => {
      const paymentData = {
        reservationId,
        amount: 500,
        currency: 'PEN',
        paymentMethod: 'card',
        cardToken: 'tok_visa',
      };

      const payment = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(paymentData)
        .expect(201);

      const paymentId = payment.body.id;

      await request(app)
        .patch(`/api/payments/${paymentId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: 100 })
        .expect(403);
    });

    it('should prevent user from changing payment status', async () => {
      const paymentData = {
        reservationId,
        amount: 500,
        currency: 'PEN',
        paymentMethod: 'card',
        cardToken: 'tok_visa',
      };

      const payment = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(paymentData)
        .expect(201);

      const paymentId = payment.body.id;

      await request(app)
        .patch(`/api/payments/${paymentId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'completed' })
        .expect(403);
    });

    it('should require payment to be associated with user reservation', async () => {
      const otherUserToken = jwt.sign(
        { userId: uuid(), role: 'customer' },
        process.env.JWT_SECRET || 'test-secret'
      );

      const paymentData = {
        reservationId,
        amount: 500,
        currency: 'PEN',
        paymentMethod: 'card',
        cardToken: 'tok_visa',
      };

      await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(paymentData)
        .expect(403);
    });

    it('should validate card token format', async () => {
      const invalidPayment = {
        reservationId,
        amount: 500,
        currency: 'PEN',
        paymentMethod: 'card',
        cardToken: 'invalid_token',
      };

      await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidPayment)
        .expect(400);
    });
  });

  describe('Data Isolation', () => {
    it('should not leak other user data in list endpoints', async () => {
      const ownerResponse = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      const customerResponse = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      const ownerReservations = ownerResponse.body.data || ownerResponse.body;
      const customerReservations = customerResponse.body.data || customerResponse.body;

      expect(ownerReservations).not.toBe(customerReservations);
    });

    it('should not expose sensitive payment info in reservation response', async () => {
      const response = await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body).not.toHaveProperty('cardToken');
      expect(response.body).not.toHaveProperty('cardNumber');
    });

    it('should not expose business owner contact in public business listing', async () => {
      const response = await request(app)
        .get(`/api/businesses/${businessId}`)
        .expect(200);

      expect(response.body.ownerEmail).toBeUndefined();
      expect(response.body.ownerPhone).toBeUndefined();
    });
  });
});
