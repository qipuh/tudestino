const request = require('supertest');
const app = require('../../src/app');
const sequelize = require('../../src/config/database');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

describe('Role-Based Access Control (RBAC) - Fase 8', () => {
  const roles = {
    admin: 'admin',
    owner: 'business_owner',
    customer: 'customer',
  };

  let tokens = {};
  let userIds = {};
  let businessId;
  let serviceId;
  let offerId;
  let reservationId;
  let paymentId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    Object.entries(roles).forEach(([key, role]) => {
      userIds[key] = uuid();
      tokens[key] = jwt.sign(
        { userId: userIds[key], role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '24h' }
      );
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Owner creates business
    const businessData = {
      name: 'Test Restaurant',
      type: 'restaurant',
    };

    const response = await request(app)
      .post('/api/businesses')
      .set('Authorization', `Bearer ${tokens.owner}`)
      .send(businessData);

    businessId = response.body.id;

    // Owner adds service
    const serviceData = {
      businessId,
      name: 'Private Room',
      type: 'addon',
      price: 500,
    };

    const serviceResponse = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${tokens.owner}`)
      .send(serviceData);

    serviceId = serviceResponse.body.id;

    // Owner creates offer
    const offerData = {
      businessId,
      code: `CODE${Math.random().toString().slice(2, 6)}`,
      description: 'Test offer',
      discountType: 'percentage',
      discountValue: 10,
    };

    const offerResponse = await request(app)
      .post('/api/offers')
      .set('Authorization', `Bearer ${tokens.owner}`)
      .send(offerData);

    offerId = offerResponse.body.id;

    // Customer makes reservation
    const reservationData = {
      businessId,
      reservationDate: new Date(Date.now() + 86400000)
        .toISOString()
        .split('T')[0],
      numberOfPeople: 2,
    };

    const resResponse = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${tokens.customer}`)
      .send(reservationData);

    reservationId = resResponse.body.id;

    // Customer makes payment
    const paymentData = {
      reservationId,
      amount: 500,
      currency: 'PEN',
      paymentMethod: 'card',
      cardToken: 'tok_visa',
    };

    const payResponse = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${tokens.customer}`)
      .send(paymentData);

    paymentId = payResponse.body.id;
  });

  describe('Customer Role Permissions', () => {
    it('should not create business', async () => {
      const businessData = { name: 'Hacked Business', type: 'restaurant' };
      await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${tokens.customer}`)
        .send(businessData)
        .expect(403);
    });

    it('should not update other business', async () => {
      const updateData = { name: 'Hacked' };
      await request(app)
        .put(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${tokens.customer}`)
        .send(updateData)
        .expect(403);
    });

    it('should not delete business', async () => {
      await request(app)
        .delete(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${tokens.customer}`)
        .expect(403);
    });

    it('should not add service to business', async () => {
      const serviceData = {
        businessId,
        name: 'Hacked Service',
        type: 'addon',
      };
      await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${tokens.customer}`)
        .send(serviceData)
        .expect(403);
    });

    it('should not create offer', async () => {
      const offerData = {
        businessId,
        code: 'HACKED',
        description: 'Hacked offer',
        discountType: 'percentage',
        discountValue: 50,
      };
      await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${tokens.customer}`)
        .send(offerData)
        .expect(403);
    });

    it('should create own reservation', async () => {
      const reservationData = {
        businessId,
        reservationDate: new Date(Date.now() + 86400000)
          .toISOString()
          .split('T')[0],
        numberOfPeople: 2,
      };
      await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${tokens.customer}`)
        .send(reservationData)
        .expect(201);
    });

    it('should view own reservations', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${tokens.customer}`)
        .expect(200);

      const reservations = response.body.data || response.body;
      expect(reservations.length).toBeGreaterThan(0);
    });

    it('should not view all reservations', async () => {
      await request(app)
        .get('/api/admin/reservations')
        .set('Authorization', `Bearer ${tokens.customer}`)
        .expect(403);
    });

    it('should make own payment', async () => {
      const newReservation = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${tokens.customer}`)
        .send({
          businessId,
          reservationDate: new Date(Date.now() + 86400000)
            .toISOString()
            .split('T')[0],
          numberOfPeople: 2,
        });

      const paymentData = {
        reservationId: newReservation.body.id,
        amount: 300,
        currency: 'PEN',
        paymentMethod: 'card',
        cardToken: 'tok_visa',
      };

      await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${tokens.customer}`)
        .send(paymentData)
        .expect(201);
    });

    it('should not approve payment', async () => {
      await request(app)
        .patch(`/api/payments/${paymentId}`)
        .set('Authorization', `Bearer ${tokens.customer}`)
        .send({ status: 'completed' })
        .expect(403);
    });

    it('should not access admin dashboard', async () => {
      await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${tokens.customer}`)
        .expect(403);
    });
  });

  describe('Business Owner Role Permissions', () => {
    it('should create own business', async () => {
      const businessData = { name: 'Owner Business', type: 'restaurant' };
      await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${tokens.owner}`)
        .send(businessData)
        .expect(201);
    });

    it('should update own business', async () => {
      const updateData = { name: 'Updated Name' };
      await request(app)
        .put(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${tokens.owner}`)
        .send(updateData)
        .expect(200);
    });

    it('should not update other business', async () => {
      const otherOwnerToken = jwt.sign(
        { userId: uuid(), role: 'business_owner' },
        process.env.JWT_SECRET || 'test-secret'
      );

      const businessData = { name: 'Other Owner Business', type: 'restaurant' };
      const otherBusiness = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${otherOwnerToken}`)
        .send(businessData);

      const updateData = { name: 'Hacked Other Business' };
      await request(app)
        .put(`/api/businesses/${otherBusiness.body.id}`)
        .set('Authorization', `Bearer ${tokens.owner}`)
        .send(updateData)
        .expect(403);
    });

    it('should delete own business', async () => {
      const businessData = { name: 'To Delete', type: 'restaurant' };
      const toDelete = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${tokens.owner}`)
        .send(businessData);

      await request(app)
        .delete(`/api/businesses/${toDelete.body.id}`)
        .set('Authorization', `Bearer ${tokens.owner}`)
        .expect(200);
    });

    it('should not delete other business', async () => {
      const otherOwnerToken = jwt.sign(
        { userId: uuid(), role: 'business_owner' },
        process.env.JWT_SECRET || 'test-secret'
      );

      const otherBusiness = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${otherOwnerToken}`)
        .send({ name: 'Other', type: 'restaurant' });

      await request(app)
        .delete(`/api/businesses/${otherBusiness.body.id}`)
        .set('Authorization', `Bearer ${tokens.owner}`)
        .expect(403);
    });

    it('should manage own business services', async () => {
      const serviceData = {
        businessId,
        name: 'Owner Service',
        type: 'addon',
      };
      await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${tokens.owner}`)
        .send(serviceData)
        .expect(201);
    });

    it('should not manage other business services', async () => {
      const otherOwnerToken = jwt.sign(
        { userId: uuid(), role: 'business_owner' },
        process.env.JWT_SECRET || 'test-secret'
      );

      const otherBusiness = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${otherOwnerToken}`)
        .send({ name: 'Other', type: 'restaurant' });

      const serviceData = {
        businessId: otherBusiness.body.id,
        name: 'Hacked Service',
        type: 'addon',
      };
      await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${tokens.owner}`)
        .send(serviceData)
        .expect(403);
    });

    it('should view own business reservations', async () => {
      const response = await request(app)
        .get(`/api/businesses/${businessId}/reservations`)
        .set('Authorization', `Bearer ${tokens.owner}`)
        .expect(200);

      const reservations = response.body.data || response.body;
      expect(reservations.length).toBeGreaterThan(0);
    });

    it('should not view all business reservations', async () => {
      await request(app)
        .get('/api/admin/reservations')
        .set('Authorization', `Bearer ${tokens.owner}`)
        .expect(403);
    });

    it('should approve own business reservations', async () => {
      await request(app)
        .patch(`/api/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${tokens.owner}`)
        .send({ status: 'confirmed' })
        .expect(200);
    });

    it('should not approve other business reservations', async () => {
      const otherOwnerToken = jwt.sign(
        { userId: uuid(), role: 'business_owner' },
        process.env.JWT_SECRET || 'test-secret'
      );

      await request(app)
        .patch(`/api/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${otherOwnerToken}`)
        .send({ status: 'confirmed' })
        .expect(403);
    });

    it('should view own business payments', async () => {
      const response = await request(app)
        .get('/api/payments')
        .query({ businessId })
        .set('Authorization', `Bearer ${tokens.owner}`)
        .expect(200);

      const payments = response.body.data || response.body;
      expect(payments.length).toBeGreaterThan(0);
    });

    it('should not access admin panel', async () => {
      await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${tokens.owner}`)
        .expect(403);
    });
  });

  describe('Admin Role Permissions', () => {
    it('should access admin dashboard', async () => {
      await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);
    });

    it('should view all businesses', async () => {
      const response = await request(app)
        .get('/api/admin/businesses')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      const businesses = response.body.data || response.body;
      expect(Array.isArray(businesses)).toBe(true);
    });

    it('should verify business', async () => {
      await request(app)
        .patch(`/api/admin/businesses/${businessId}/verify`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({ verified: true })
        .expect(200);
    });

    it('should view all payments', async () => {
      const response = await request(app)
        .get('/api/admin/payments')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      const payments = response.body.data || response.body;
      expect(Array.isArray(payments)).toBe(true);
    });

    it('should process payment settlement', async () => {
      await request(app)
        .patch(`/api/admin/payments/${paymentId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({ status: 'settled' })
        .expect(200);
    });

    it('should view all users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);

      const users = response.body.data || response.body;
      expect(Array.isArray(users)).toBe(true);
    });

    it('should not create business as admin', async () => {
      const businessData = { name: 'Admin Business', type: 'restaurant' };
      await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(businessData)
        .expect(403);
    });

    it('should not make reservations as admin', async () => {
      const reservationData = {
        businessId,
        reservationDate: new Date(Date.now() + 86400000)
          .toISOString()
          .split('T')[0],
        numberOfPeople: 2,
      };
      await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(reservationData)
        .expect(403);
    });
  });
});
