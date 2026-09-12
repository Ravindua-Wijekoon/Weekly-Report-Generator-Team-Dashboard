const request = require('supertest');
const bcrypt = require('bcryptjs');

const app = require('../src/app');
const Project = require('../src/models/Project');
const User = require('../src/models/User');
const testDb = require('./setup/testDb');

async function createManager({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return User.create({ name, email, passwordHash, role: 'manager' });
}

describe('Report RBAC', () => {
  let memberAAgent;
  let memberBAgent;
  let managerAgent;
  let project;

  beforeAll(async () => {
    await testDb.connect();
  });

  afterAll(async () => {
    await testDb.closeDatabase();
  });

  beforeEach(async () => {
    await testDb.clearDatabase();

    memberAAgent = request.agent(app);
    memberBAgent = request.agent(app);
    managerAgent = request.agent(app);

    await memberAAgent
      .post('/api/auth/register')
      .send({ name: 'Member A', email: 'a@example.com', password: 'password123' });
    await memberBAgent
      .post('/api/auth/register')
      .send({ name: 'Member B', email: 'b@example.com', password: 'password123' });

    await createManager({ name: 'Manager', email: 'manager@example.com', password: 'password123' });
    await managerAgent.post('/api/auth/login').send({ email: 'manager@example.com', password: 'password123' });

    project = await Project.create({ name: 'Test Project' });
  });

  test('unauthenticated request is rejected', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.status).toBe(401);
  });

  test('owner can create and read their own report', async () => {
    const createRes = await memberAAgent.post('/api/reports').send({ project: project._id.toString() });
    expect(createRes.status).toBe(201);

    const getRes = await memberAAgent.get(`/api/reports/${createRes.body.report._id}`);
    expect(getRes.status).toBe(200);
  });

  test('a different member cannot read or edit someone else\'s report', async () => {
    const createRes = await memberAAgent.post('/api/reports').send({ project: project._id.toString() });
    const reportId = createRes.body.report._id;

    const getRes = await memberBAgent.get(`/api/reports/${reportId}`);
    expect(getRes.status).toBe(403);

    const patchRes = await memberBAgent.patch(`/api/reports/${reportId}`).send({ content: { notes: 'hacked' } });
    expect(patchRes.status).toBe(403);
  });

  test('a member cannot review their own report even though they own it', async () => {
    const createRes = await memberAAgent.post('/api/reports').send({ project: project._id.toString() });
    const reportId = createRes.body.report._id;
    await memberAAgent.post(`/api/reports/${reportId}/submit`);

    const reviewRes = await memberAAgent.post(`/api/reports/${reportId}/review`).send({ action: 'approve' });
    expect(reviewRes.status).toBe(403);
  });

  test('a member cannot widen their list query with an owner override', async () => {
    await memberAAgent.post('/api/reports').send({ project: project._id.toString() });
    await memberBAgent.post('/api/reports').send({ project: project._id.toString() });

    const meBRes = await memberBAgent.get('/api/auth/me');
    const memberBId = meBRes.body.user.id;

    const res = await memberAAgent.get(`/api/reports?owner=${memberBId}`);
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(1);
    expect(res.body.data[0].owner._id).not.toBe(memberBId);
  });

  test('manager sees reports from all members', async () => {
    await memberAAgent.post('/api/reports').send({ project: project._id.toString() });
    await memberBAgent.post('/api/reports').send({ project: project._id.toString() });

    const res = await managerAgent.get('/api/reports');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(2);
  });

  test('manager request_changes is tagged to the correct version and cannot smuggle content', async () => {
    const createRes = await memberAAgent.post('/api/reports').send({ project: project._id.toString() });
    const reportId = createRes.body.report._id;

    await memberAAgent.patch(`/api/reports/${reportId}`).send({ content: { notes: 'original notes' } });
    await memberAAgent.post(`/api/reports/${reportId}/submit`);

    const reviewRes = await managerAgent
      .post(`/api/reports/${reportId}/review`)
      .send({ action: 'request_changes', comment: 'please fix this', content: { notes: 'HACKED' } });

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.report.status).toBe('needs_correction');
    expect(reviewRes.body.report.content.notes).toBe('original notes');

    const versionsRes = await memberAAgent.get(`/api/reports/${reportId}/versions`);
    expect(versionsRes.body.versions).toHaveLength(1);
    expect(versionsRes.body.reviewComments[0].targetVersionNumber).toBe(1);
  });

  test('cannot edit while submitted; resubmitting after needs_correction produces a second version', async () => {
    const createRes = await memberAAgent.post('/api/reports').send({ project: project._id.toString() });
    const reportId = createRes.body.report._id;
    await memberAAgent.post(`/api/reports/${reportId}/submit`);

    const editWhileSubmitted = await memberAAgent.patch(`/api/reports/${reportId}`).send({ content: { notes: 'nope' } });
    expect(editWhileSubmitted.status).toBe(409);

    await managerAgent.post(`/api/reports/${reportId}/review`).send({ action: 'request_changes', comment: 'fix it' });

    const editRes = await memberAAgent.patch(`/api/reports/${reportId}`).send({ content: { notes: 'fixed' } });
    expect(editRes.status).toBe(200);

    const resubmitRes = await memberAAgent.post(`/api/reports/${reportId}/submit`);
    expect(resubmitRes.status).toBe(200);
    expect(resubmitRes.body.report.currentVersionNumber).toBe(2);
    expect(resubmitRes.body.report.versions).toHaveLength(2);
  });

  test('reviewing a report that was never submitted is rejected', async () => {
    const createRes = await memberAAgent.post('/api/reports').send({ project: project._id.toString() });
    const reportId = createRes.body.report._id;

    const reviewRes = await managerAgent.post(`/api/reports/${reportId}/review`).send({ action: 'approve' });
    expect(reviewRes.status).toBe(409);
  });

  test('a report is fully locked once approved', async () => {
    const createRes = await memberAAgent.post('/api/reports').send({ project: project._id.toString() });
    const reportId = createRes.body.report._id;
    await memberAAgent.post(`/api/reports/${reportId}/submit`);
    await managerAgent.post(`/api/reports/${reportId}/review`).send({ action: 'approve' });

    const editRes = await memberAAgent.patch(`/api/reports/${reportId}`).send({ content: { notes: 'too late' } });
    expect(editRes.status).toBe(409);

    const submitRes = await memberAAgent.post(`/api/reports/${reportId}/submit`);
    expect(submitRes.status).toBe(409);

    const reviewAgainRes = await managerAgent.post(`/api/reports/${reportId}/review`).send({ action: 'approve' });
    expect(reviewAgainRes.status).toBe(409);
  });
});
