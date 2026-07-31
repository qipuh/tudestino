# Integration Testing - Fase 7

Complete E2E and integration test suite for the polymorph businesses platform.

## Test Structure

```
tests/
├── integration/
│   ├── businesses.test.js        # Business CRUD + list/search
│   ├── reservations.test.js      # Reservation lifecycle
│   ├── services-offers.test.js   # Services & offers management
│   └── e2e-flows.test.js         # Complete business flows
├── setup.js                      # Global test configuration
└── fixtures/                     # Mock data (if needed)
```

## Running Tests

### Prerequisites
```bash
npm install --save-dev jest supertest
```

### All Tests
```bash
npm test
```

### Specific Test Suite
```bash
npm test -- businesses.test.js
npm test -- reservations.test.js
npm test -- services-offers.test.js
npm test -- e2e-flows.test.js
```

### With Coverage
```bash
npm test -- --coverage
```

### Watch Mode (development)
```bash
npm test -- --watch
```

## Test Coverage

### Businesses (businesses.test.js)
- ✅ Create business (restaurant, hotel, tour, etc)
- ✅ Authentication required
- ✅ Business type validation
- ✅ Retrieve business with relations (include=true)
- ✅ Update business (owner only)
- ✅ List businesses with pagination
- ✅ Filter by type
- ✅ Delete business

### Reservations (reservations.test.js)
- ✅ Create reservation (date, time, guests)
- ✅ Future date validation
- ✅ Guest count validation
- ✅ List user reservations
- ✅ Filter by status (pending, confirmed, completed, cancelled)
- ✅ Retrieve reservation detail
- ✅ Update status (user + owner)
- ✅ Cancel reservation
- ✅ Authorization checks (user access)

### Services & Offers (services-offers.test.js)
- ✅ Create service with pricing
- ✅ List services by business
- ✅ Filter services by type
- ✅ Update service
- ✅ Delete service
- ✅ Create offers (percentage, fixed amount, free)
- ✅ Unique offer code per business
- ✅ List offers with active filtering
- ✅ Validate offer code
- ✅ Reject expired/maxed out offers
- ✅ Update offer
- ✅ Delete offer

### End-to-End Flows (e2e-flows.test.js)

#### Restaurant Reservation Flow
1. Owner creates restaurant business
2. Owner adds premium services (private room, wine pairing)
3. Owner creates promotional offer (20% off)
4. Customer discovers business
5. Customer makes reservation (4 people, specific time)
6. Customer validates and applies offer
7. Customer processes payment
8. Owner approves reservation
9. Payment completes
10. Payout generated for owner
11. Complete booking retrieved

#### Hotel Booking Flow
1. Create hotel business
2. Add room services with capacity
3. Customer books multi-night stay
4. Verify multi-night pricing

#### Error Recovery
- Handle concurrent reservations
- Payment retry scenarios
- Graceful error handling

## Expected Behavior

### Success Cases (201/200)
```
POST /api/businesses → 201 (created)
GET /api/businesses → 200 (array with pagination)
PUT /api/businesses/:id → 200 (updated)
DELETE /api/businesses/:id → 200 (deleted)
```

### Error Cases
```
POST /api/businesses (no auth) → 401 (unauthorized)
POST /api/businesses (invalid type) → 400 (bad request)
GET /api/businesses/nonexistent → 404 (not found)
PUT /api/businesses/:id (not owner) → 403 (forbidden)
POST /api/services (not business owner) → 403 (forbidden)
POST /api/offers (duplicate code) → 400 (conflict)
POST /api/offers/validate (expired) → 400 (invalid)
```

## Database

Tests use a separate test database (`tudestino_test`). Each test suite:
1. Drops and recreates schema (via `sync({ force: true })`)
2. Runs isolated tests
3. No cross-contamination between suites

## Authentication in Tests

Tests mock authentication via Bearer tokens:
```javascript
.set('Authorization', `Bearer ${authToken}`)
```

Token format is not validated; actual auth implementation determines validity.

## Fixtures & Factories

For common patterns, consider creating factories:
```javascript
const createTestBusiness = (overrides = {}) => ({
  name: 'Test Business',
  type: 'restaurant',
  ...overrides,
});
```

## Debugging

### See detailed output
```bash
npm test -- --verbose
```

### Run single test
```bash
npm test -- -t "should create business"
```

### Debug with inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Common Issues

### Database Connection
- Verify MySQL is running
- Check `.env` or hardcoded DB credentials in `tests/setup.js`
- Ensure test DB exists: `CREATE DATABASE tudestino_test;`

### Timeout Errors
- Increase `testTimeout` in `jest.config.js`
- Check async/await on API calls

### Token Validation
- Tests don't validate JWT; they pass bearer tokens as-is
- Actual auth middleware must allow test tokens

## Next Steps

### Fase 8: Security & Authorization
After integration tests pass:
- Add auth validation tests
- Test role-based access control (admin, owner, customer)
- Verify payment authorization
- Test data isolation between users
