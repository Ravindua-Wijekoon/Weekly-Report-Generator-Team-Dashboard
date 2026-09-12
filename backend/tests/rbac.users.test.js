const request = require('supertest');
const bcrypt = require('bcryptjs');

const app = require('../src/app');
const User = require('../src/models/User');
const testDb = require('./setup/testDb');

describe('User management RBAC', () => {
  let memberAgent;
  let managerAgent;
  let memberId;

  beforeAll(async () => {
    await testDb.connect();
  });

  afterAll(async () => {
    await testDb.closeDatabase();
  });

  beforeEach(async () => {
    await testDb.clearDatabase();

    memberAgent = request.agent(app);
    managerAgent = request.agent(app);

    const registerRes = await memberAgent
      .post('/api/auth/register')
      .send({ name: 'Member', email: 'member@example.com', password: 'password123' });
    memberId = registerRes.body.user.id;

    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({ name: 'Manager', email: 'manager@example.com', passwordHash, role: 'manager' });
    await managerAgent.post('/api/auth/login').send({ email: 'manager@example.com', password: 'password123' });
  });

  test('member cannot list users', async () => {
    const res = await memberAgent.get('/api/users');
    expect(res.status).toBe(403);
  });

  test('member cannot invite a new user', async () => {
    const res = await memberAgent
      .post('/api/users')
      .send({ name: 'New', email: 'new@example.com', password: 'password123' });
    expect(res.status).toBe(403);
  });

  test('member cannot promote themselves to manager', async () => {
    const res = await memberAgent.patch(`/api/users/${memberId}`).send({ role: 'manager' });
    expect(res.status).toBe(403);
  });

  test('member can fetch their own profile but not someone else\'s', async () => {
    const selfRes = await memberAgent.get(`/api/users/${memberId}`);
    expect(selfRes.status).toBe(200);

    const managerMeRes = await managerAgent.get('/api/auth/me');
    const managerId = managerMeRes.body.user.id;

    const otherRes = await memberAgent.get(`/api/users/${managerId}`);
    expect(otherRes.status).toBe(403);
  });

  test('manager can promote a member and the change takes effect immediately', async () => {
    const res = await managerAgent.patch(`/api/users/${memberId}`).send({ role: 'manager' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('manager');
  });
});
