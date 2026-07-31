const request = require('supertest');
const app = require('../../src/app');
const sequelize = require('../../src/config/database');
const { v4: uuid } = require('uuid');

describe('Services & Offers Integration Tests', () => {
  let businessId;
  let authToken;
  let serviceId;
  let offerId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Create business
    const businessData = {
      name: 'Test Restaurant',
      type: 'restaurant',
    };

    const businessResponse = await request(app)
      .post('/api/businesses')
      .set('Authorization', `Bearer ${authToken}`)
      .send(businessData);

    businessId = businessResponse.body.id;
  });

  describe('Services CRUD', () => {
    describe('POST /api/services - Create Service', () => {
      it('should create service for business', async () => {
        const serviceData = {
          businessId,
          name: 'Private Dining',
          type: 'private_room',
          description: 'Exclusive private dining room',
          price: 500,
          currency: 'PEN',
          settings: {
            maxGuests: 20,
            minNotice: 24,
          },
        };

        const response = await request(app)
          .post('/api/services')
          .set('Authorization', `Bearer ${authToken}`)
          .send(serviceData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(serviceData.name);
        expect(response.body.price).toBe(serviceData.price);
        serviceId = response.body.id;
      });

      it('should require business owner', async () => {
        const serviceData = {
          businessId,
          name: 'Service',
          type: 'addon',
        };

        await request(app)
          .post('/api/services')
          .set('Authorization', `Bearer ${otherUserToken}`)
          .send(serviceData)
          .expect(403);
      });
    });

    describe('GET /api/services - List Services', () => {
      it('should list services for business', async () => {
        const response = await request(app)
          .get('/api/services')
          .query({ businessId })
          .expect(200);

        const services = response.body.data || response.body;
        expect(Array.isArray(services)).toBe(true);
        expect(services.length).toBeGreaterThan(0);
      });

      it('should filter by type', async () => {
        const response = await request(app)
          .get('/api/services')
          .query({ businessId, type: 'private_room' })
          .expect(200);

        const services = response.body.data || response.body;
        expect(services.every(s => s.type === 'private_room')).toBe(true);
      });
    });

    describe('PUT /api/services/:id - Update Service', () => {
      it('should update service', async () => {
        const updateData = {
          name: 'Updated Private Dining',
          price: 600,
        };

        const response = await request(app)
          .put(`/api/services/${serviceId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.name).toBe(updateData.name);
        expect(response.body.price).toBe(updateData.price);
      });
    });

    describe('DELETE /api/services/:id - Delete Service', () => {
      let deleteServiceId;

      beforeEach(async () => {
        const serviceData = {
          businessId,
          name: 'Service to Delete',
          type: 'addon',
        };

        const response = await request(app)
          .post('/api/services')
          .set('Authorization', `Bearer ${authToken}`)
          .send(serviceData);

        deleteServiceId = response.body.id;
      });

      it('should delete service', async () => {
        await request(app)
          .delete(`/api/services/${deleteServiceId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        await request(app)
          .get(`/api/services/${deleteServiceId}`)
          .expect(404);
      });
    });
  });

  describe('Offers CRUD', () => {
    describe('POST /api/offers - Create Offer', () => {
      it('should create percentage discount offer', async () => {
        const offerData = {
          businessId,
          code: 'WELCOME20',
          description: '20% off for new customers',
          discountType: 'percentage',
          discountValue: 20,
          maxUses: 100,
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
        };

        const response = await request(app)
          .post('/api/offers')
          .set('Authorization', `Bearer ${authToken}`)
          .send(offerData)
          .expect(201);

        expect(response.body.code).toBe(offerData.code);
        expect(response.body.discountType).toBe('percentage');
        offerId = response.body.id;
      });

      it('should create fixed amount offer', async () => {
        const offerData = {
          businessId,
          code: 'SAVE50',
          description: 'Save S/50',
          discountType: 'fixed',
          discountValue: 50,
          currency: 'PEN',
        };

        const response = await request(app)
          .post('/api/offers')
          .set('Authorization', `Bearer ${authToken}`)
          .send(offerData)
          .expect(201);

        expect(response.body.discountType).toBe('fixed');
        expect(response.body.discountValue).toBe(50);
      });

      it('should require unique code per business', async () => {
        const offerData = {
          businessId,
          code: 'WELCOME20',
          description: 'Duplicate code',
          discountType: 'percentage',
          discountValue: 15,
        };

        await request(app)
          .post('/api/offers')
          .set('Authorization', `Bearer ${authToken}`)
          .send(offerData)
          .expect(400);
      });
    });

    describe('GET /api/offers - List Offers', () => {
      it('should list business offers', async () => {
        const response = await request(app)
          .get('/api/offers')
          .query({ businessId })
          .expect(200);

        const offers = response.body.data || response.body;
        expect(Array.isArray(offers)).toBe(true);
        expect(offers.length).toBeGreaterThan(0);
      });

      it('should filter by active status', async () => {
        const response = await request(app)
          .get('/api/offers')
          .query({ businessId, active: true })
          .expect(200);

        const offers = response.body.data || response.body;
        expect(offers.every(o => o.active === true)).toBe(true);
      });
    });

    describe('POST /api/offers/validate - Validate Offer Code', () => {
      it('should validate valid offer code', async () => {
        const response = await request(app)
          .post('/api/offers/validate')
          .send({ code: 'WELCOME20' })
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body.code).toBe('WELCOME20');
      });

      it('should reject invalid code', async () => {
        await request(app)
          .post('/api/offers/validate')
          .send({ code: 'INVALIDCODE' })
          .expect(404);
      });

      it('should reject expired offer', async () => {
        const expiredOfferData = {
          businessId,
          code: 'EXPIRED',
          description: 'Expired offer',
          discountType: 'percentage',
          discountValue: 10,
          validUntil: new Date(Date.now() - 86400000).toISOString(),
        };

        await request(app)
          .post('/api/offers')
          .set('Authorization', `Bearer ${authToken}`)
          .send(expiredOfferData);

        await request(app)
          .post('/api/offers/validate')
          .send({ code: 'EXPIRED' })
          .expect(400);
      });

      it('should reject maxed out uses', async () => {
        const maxedOfferData = {
          businessId,
          code: 'MAXED',
          description: 'Maxed out',
          discountType: 'percentage',
          discountValue: 10,
          maxUses: 1,
          usedCount: 1,
        };

        await request(app)
          .post('/api/offers')
          .set('Authorization', `Bearer ${authToken}`)
          .send(maxedOfferData);

        await request(app)
          .post('/api/offers/validate')
          .send({ code: 'MAXED' })
          .expect(400);
      });
    });

    describe('PUT /api/offers/:id - Update Offer', () => {
      it('should update offer details', async () => {
        const updateData = {
          discountValue: 25,
          maxUses: 200,
        };

        const response = await request(app)
          .put(`/api/offers/${offerId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.discountValue).toBe(25);
        expect(response.body.maxUses).toBe(200);
      });
    });

    describe('DELETE /api/offers/:id - Delete Offer', () => {
      let deleteOfferId;

      beforeEach(async () => {
        const offerData = {
          businessId,
          code: 'TODELETE',
          description: 'To delete',
          discountType: 'percentage',
          discountValue: 10,
        };

        const response = await request(app)
          .post('/api/offers')
          .set('Authorization', `Bearer ${authToken}`)
          .send(offerData);

        deleteOfferId = response.body.id;
      });

      it('should delete offer', async () => {
        await request(app)
          .delete(`/api/offers/${deleteOfferId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        await request(app)
          .get(`/api/offers/${deleteOfferId}`)
          .expect(404);
      });
    });
  });
});
