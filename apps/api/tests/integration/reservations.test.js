const request = require('supertest');
const app = require('../../src/app');
const sequelize = require('../../src/config/database');
const { v4: uuid } = require('uuid');

describe('Reservations Integration Tests', () => {
  let businessId;
  let userId;
  let authToken;
  let reservationId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Setup: Create business and user
    const businessData = {
      name: 'Test Business',
      type: 'restaurant',
      description: 'Test',
    };

    const businessResponse = await request(app)
      .post('/api/businesses')
      .set('Authorization', `Bearer ${authToken}`)
      .send(businessData);

    businessId = businessResponse.body.id;
  });

  describe('POST /api/reservations - Create Reservation', () => {
    it('should create reservation for business', async () => {
      const reservationData = {
        businessId,
        reservationDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        numberOfPeople: 4,
        reservationTime: '19:00',
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.businessId).toBe(businessId);
      expect(response.body.numberOfPeople).toBe(4);
      expect(response.body.status).toBe('pending');
      reservationId = response.body.id;
    });

    it('should require future date', async () => {
      const pastDate = new Date(Date.now() - 86400000)
        .toISOString()
        .split('T')[0];

      const reservationData = {
        businessId,
        reservationDate: pastDate,
        numberOfPeople: 2,
      };

      await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(400);
    });

    it('should validate number of people', async () => {
      const reservationData = {
        businessId,
        reservationDate: new Date(Date.now() + 86400000)
          .toISOString()
          .split('T')[0],
        numberOfPeople: 0,
      };

      await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData)
        .expect(400);
    });

    it('should require authentication', async () => {
      const reservationData = {
        businessId,
        reservationDate: new Date(Date.now() + 86400000)
          .toISOString()
          .split('T')[0],
        numberOfPeople: 2,
      };

      await request(app)
        .post('/api/reservations')
        .send(reservationData)
        .expect(401);
    });
  });

  describe('GET /api/reservations - List User Reservations', () => {
    it('should list authenticated user reservations', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data || response.body)).toBe(true);
      if (response.body.data) {
        expect(response.body.data[0]).toHaveProperty('businessId');
      }
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .query({ status: 'pending' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const reservations = response.body.data || response.body;
      expect(reservations.every(r => r.status === 'pending')).toBe(true);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/reservations')
        .expect(401);
    });
  });

  describe('GET /api/reservations/:id - Get Reservation', () => {
    it('should retrieve reservation details', async () => {
      const response = await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(reservationId);
      expect(response.body.businessId).toBe(businessId);
    });

    it('should return 404 for non-existent reservation', async () => {
      const fakeId = uuid();
      await request(app)
        .get(`/api/reservations/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should prevent unauthorized access', async () => {
      await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/reservations/:id/status - Update Reservation Status', () => {
    it('should update status to confirmed', async () => {
      const response = await request(app)
        .patch(`/api/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(response.body.status).toBe('confirmed');
    });

    it('should allow business owner to update', async () => {
      const response = await request(app)
        .patch(`/api/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.status).toBe('completed');
    });

    it('should validate status value', async () => {
      await request(app)
        .patch(`/api/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);
    });
  });

  describe('DELETE /api/reservations/:id - Cancel Reservation', () => {
    let cancellableReservationId;

    beforeEach(async () => {
      const reservationData = {
        businessId,
        reservationDate: new Date(Date.now() + 86400000)
          .toISOString()
          .split('T')[0],
        numberOfPeople: 2,
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservationData);

      cancellableReservationId = response.body.id;
    });

    it('should cancel pending reservation', async () => {
      await request(app)
        .delete(`/api/reservations/${cancellableReservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const getResponse = await request(app)
        .get(`/api/reservations/${cancellableReservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.status).toBe('cancelled');
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/reservations/${cancellableReservationId}`)
        .expect(401);
    });
  });
});
