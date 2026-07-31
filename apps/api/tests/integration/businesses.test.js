const request = require('supertest');
const app = require('../../src/app');
const sequelize = require('../../src/config/database');
const { v4: uuid } = require('uuid');

describe('Businesses Integration Tests', () => {
  let businessId;
  let userId;
  let authToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/businesses - Create Business', () => {
    it('should create a new restaurant business', async () => {
      const businessData = {
        name: 'Test Restaurant',
        type: 'restaurant',
        description: 'A test restaurant',
        phoneNumber: '+51987654321',
        email: 'test@restaurant.com',
        address: {
          street: 'Calle Test 123',
          city: 'Lima',
          state: 'Lima',
          country: 'Peru',
          zipCode: '15001',
        },
      };

      const response = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(businessData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(businessData.name);
      expect(response.body.type).toBe(businessData.type);
      businessId = response.body.id;
    });

    it('should fail without authentication', async () => {
      const businessData = {
        name: 'Unauthorized Business',
        type: 'restaurant',
      };

      await request(app)
        .post('/api/businesses')
        .send(businessData)
        .expect(401);
    });

    it('should fail with invalid business type', async () => {
      const businessData = {
        name: 'Invalid Business',
        type: 'invalid_type',
      };

      await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(businessData)
        .expect(400);
    });
  });

  describe('GET /api/businesses/:id - Get Business Detail', () => {
    it('should retrieve business with relations', async () => {
      const response = await request(app)
        .get(`/api/businesses/${businessId}`)
        .query({ include: true })
        .expect(200);

      expect(response.body.id).toBe(businessId);
      expect(response.body.name).toBe('Test Restaurant');
      expect(response.body.services).toBeDefined();
    });

    it('should return 404 for non-existent business', async () => {
      const fakeId = uuid();
      await request(app)
        .get(`/api/businesses/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/businesses/:id - Update Business', () => {
    it('should update business details', async () => {
      const updateData = {
        name: 'Updated Restaurant',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should fail if not business owner', async () => {
      const updateData = { name: 'Hacked Restaurant' };

      await request(app)
        .put(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(updateData)
        .expect(403);
    });
  });

  describe('GET /api/businesses - List Businesses', () => {
    it('should list all businesses', async () => {
      const response = await request(app)
        .get('/api/businesses')
        .expect(200);

      expect(Array.isArray(response.body.data || response.body)).toBe(true);
      expect(response.body.data?.length || response.body.length).toBeGreaterThan(0);
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/businesses')
        .query({ type: 'restaurant' })
        .expect(200);

      const businesses = response.body.data || response.body;
      expect(businesses.every(b => b.type === 'restaurant')).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/businesses')
        .query({ limit: 10, offset: 0 })
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('rows');
    });
  });

  describe('DELETE /api/businesses/:id - Delete Business', () => {
    let testBusinessId;

    beforeEach(async () => {
      const businessData = {
        name: 'Business to Delete',
        type: 'restaurant',
      };

      const response = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(businessData);

      testBusinessId = response.body.id;
    });

    it('should delete business', async () => {
      await request(app)
        .delete(`/api/businesses/${testBusinessId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app)
        .get(`/api/businesses/${testBusinessId}`)
        .expect(404);
    });

    it('should fail if not owner', async () => {
      await request(app)
        .delete(`/api/businesses/${testBusinessId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });
  });
});
