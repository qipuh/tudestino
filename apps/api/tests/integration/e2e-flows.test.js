const request = require('supertest');
const app = require('../../src/app');
const sequelize = require('../../src/config/database');

describe('End-to-End Business Flows', () => {
  let businessOwnerToken;
  let customerToken;
  let businessId;
  let serviceId;
  let offerId;
  let reservationId;
  let paymentId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Complete Restaurant Reservation Flow', () => {
    it('1. Owner creates restaurant business', async () => {
      const businessData = {
        name: 'La Bella Italia',
        type: 'restaurant',
        description: 'Authentic Italian restaurant',
        phoneNumber: '+51987654321',
        email: 'info@labellaitalia.com',
        address: {
          street: 'Av. Conquistadores 1000',
          city: 'San Isidro',
          state: 'Lima',
          country: 'Peru',
          zipCode: '15072',
        },
      };

      const response = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .send(businessData)
        .expect(201);

      businessId = response.body.id;
      expect(response.body.name).toBe(businessData.name);
      expect(response.body.verified).toBe(false);
    });

    it('2. Owner adds premium services', async () => {
      const servicesData = [
        {
          name: 'Private Room',
          type: 'private_room',
          description: 'Exclusive dining room for special events',
          price: 500,
          currency: 'PEN',
          settings: { maxGuests: 20 },
        },
        {
          name: 'Wine Pairing',
          type: 'addon',
          description: 'Sommelier-selected wine pairings',
          price: 150,
          currency: 'PEN',
        },
      ];

      for (const serviceData of servicesData) {
        const response = await request(app)
          .post('/api/services')
          .set('Authorization', `Bearer ${businessOwnerToken}`)
          .send({ businessId, ...serviceData })
          .expect(201);

        if (!serviceId) serviceId = response.body.id;
      }
    });

    it('3. Owner creates promotional offer', async () => {
      const offerData = {
        businessId,
        code: 'OPENING20',
        description: '20% off grand opening promotion',
        discountType: 'percentage',
        discountValue: 20,
        maxUses: 500,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
      };

      const response = await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .send(offerData)
        .expect(201);

      offerId = response.body.id;
      expect(response.body.code).toBe('OPENING20');
    });

    it('4. Customer discovers business', async () => {
      const response = await request(app)
        .get(`/api/businesses/${businessId}`)
        .query({ include: true })
        .expect(200);

      expect(response.body.name).toBe('La Bella Italia');
      expect(response.body.services).toBeDefined();
    });

    it('5. Customer makes reservation', async () => {
      const reservationDate = new Date(Date.now() + 7 * 86400000)
        .toISOString()
        .split('T')[0];

      const reservationData = {
        businessId,
        reservationDate,
        numberOfPeople: 4,
        reservationTime: '20:00',
        serviceId,
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(reservationData)
        .expect(201);

      reservationId = response.body.id;
      expect(response.body.status).toBe('pending');
      expect(response.body.totalPrice).toBeUndefined();
    });

    it('6. Customer validates and applies offer', async () => {
      const validateResponse = await request(app)
        .post('/api/offers/validate')
        .send({ code: 'OPENING20' })
        .expect(200);

      expect(validateResponse.body.discountType).toBe('percentage');
      expect(validateResponse.body.discountValue).toBe(20);
    });

    it('7. Customer processes payment', async () => {
      const paymentData = {
        reservationId,
        amount: 400,
        currency: 'PEN',
        paymentMethod: 'card',
        cardToken: 'tok_visa',
        offerId,
      };

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(paymentData)
        .expect(201);

      paymentId = response.body.id;
      expect(response.body.status).toBe('pending');
      expect(response.body.grossAmount).toBe(400);
      expect(response.body.discountAmount).toBe(100);
    });

    it('8. Owner approves reservation', async () => {
      const response = await request(app)
        .patch(`/api/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(response.body.status).toBe('confirmed');
    });

    it('9. Payment processing completes', async () => {
      const response = await request(app)
        .patch(`/api/payments/${paymentId}`)
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.status).toBe('completed');
    });

    it('10. Payout generated for owner', async () => {
      const response = await request(app)
        .get('/api/payouts')
        .query({ businessId })
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .expect(200);

      const payouts = response.body.data || response.body;
      expect(payouts.length).toBeGreaterThan(0);
      expect(payouts[0].businessId).toBe(businessId);
    });

    it('11. Verify complete booking can be retrieved', async () => {
      const response = await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.status).toBe('confirmed');
      expect(response.body.businessId).toBe(businessId);
      expect(response.body.userId).toBe(customerId);
    });
  });

  describe('Complete Hotel Booking Flow', () => {
    let hotelBusinessId;
    let roomId;
    let checkIn;
    let checkOut;

    it('1. Create hotel business', async () => {
      const businessData = {
        name: 'Luxury Hotel Lima',
        type: 'hotel',
        description: '5-star hotel in downtown Lima',
        phoneNumber: '+51987654321',
        email: 'reservations@luxuryhotellima.com',
      };

      const response = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .send(businessData)
        .expect(201);

      hotelBusinessId = response.body.id;
    });

    it('2. Add hotel services (rooms)', async () => {
      const roomData = {
        businessId: hotelBusinessId,
        name: 'Deluxe Suite',
        type: 'accommodation',
        description: 'Luxury suite with city view',
        price: 300,
        currency: 'PEN',
        settings: {
          maxGuests: 2,
          beds: 1,
        },
      };

      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .send(roomData)
        .expect(201);

      roomId = response.body.id;
    });

    it('3. Customer books multi-night stay', async () => {
      checkIn = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      checkOut = new Date(Date.now() + 3 * 86400000)
        .toISOString()
        .split('T')[0];

      const reservationData = {
        businessId: hotelBusinessId,
        serviceId: roomId,
        reservationDate: checkIn,
        reservationTime: '14:00',
        numberOfPeople: 2,
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(reservationData)
        .expect(201);

      expect(response.body.numberOfPeople).toBe(2);
    });

    it('4. Verify multi-night pricing', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .query({ businessId: hotelBusinessId })
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .expect(200);

      const reservations = response.body.data || response.body;
      const booking = reservations[0];
      expect(booking.totalPrice).toBe(600);
    });
  });

  describe('Error Recovery Flows', () => {
    it('Should handle concurrent reservations gracefully', async () => {
      const testBusinessData = {
        name: 'Busy Restaurant',
        type: 'restaurant',
      };

      const businessResponse = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${businessOwnerToken}`)
        .send(testBusinessData);

      const testBusinessId = businessResponse.body.id;
      const reservationDate = new Date(Date.now() + 86400000)
        .toISOString()
        .split('T')[0];

      const reservationData = {
        businessId: testBusinessId,
        reservationDate,
        numberOfPeople: 2,
      };

      const promises = Array(5)
        .fill()
        .map(() =>
          request(app)
            .post('/api/reservations')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(reservationData)
        );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.status === 201).length;
      expect(successCount).toBe(5);
    });

    it('Should handle payment retry scenarios', async () => {
      const reservationData = {
        businessId,
        reservationDate: new Date(Date.now() + 86400000)
          .toISOString()
          .split('T')[0],
        numberOfPeople: 2,
      };

      const reservation = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(reservationData);

      const paymentData = {
        reservationId: reservation.body.id,
        amount: 500,
        currency: 'PEN',
        paymentMethod: 'card',
        cardToken: 'tok_chargeDeclined',
      };

      const failedPayment = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(paymentData);

      expect(failedPayment.body.status).toBe('failed');

      const retryPayment = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ ...paymentData, cardToken: 'tok_visa' });

      expect(retryPayment.body.status).toBe('pending');
    });
  });
});
