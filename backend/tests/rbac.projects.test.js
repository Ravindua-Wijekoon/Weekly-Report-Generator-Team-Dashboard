const request = require('supertest');
const bcrypt = require('bcryptjs');

const app = require('../src/app');
const User = require('../src/models/User');
const testDb = require('./setup/testDb');

describe('Project RBAC', () => {
  let memberAgent;
  let managerAgent;

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

    await memberAgent
      .post('/api/auth/register')
      .send({ name: 'Member', email: 'member@example.com', password: 'password123' });

    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({ name: 'Manager', email: 'manager@example.com', passwordHash, role: 'manager' });
    await managerAgent.post('/api/auth/login').send({ email: 'manager@example.com', password: 'password123' });
  });

  test('member cannot create a project', async () => {
    const res = await memberAgent.post('/api/projects').send({ name: 'New Project' });
    expect(res.status).toBe(403);
  });

  test('member can read the project list', async () => {
    await managerAgent.post('/api/projects').send({ name: 'Client A' });
    const res = await memberAgent.get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('member cannot update or delete a project', async () => {
    const createRes = await managerAgent.post('/api/projects').send({ name: 'Client A' });
    const projectId = createRes.body.project._id;

    const patchRes = await memberAgent.patch(`/api/projects/${projectId}`).send({ name: 'Hacked' });
    expect(patchRes.status).toBe(403);

    const deleteRes = await memberAgent.delete(`/api/projects/${projectId}`);
    expect(deleteRes.status).toBe(403);
  });
});
