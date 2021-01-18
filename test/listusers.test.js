const request = require('supertest');
const app = require('../app');
const { authenticateUser, extractAuthorizationToken } = require('./utils');
const { insertUser } = require('./factories');

describe('GET /users', () => {
  test('token missing', async () => {
    let response = '';
    const user = await insertUser();
    await Promise.all([
      authenticateUser(user),
      // eslint-disable-next-line no-async-promise-executor
      new Promise(async resolve => {
        response = await request(app).get('/users');
        return resolve();
      })
    ]);
    expect(response.statusCode).toBe(401);
  });

  test('invalid token', async () => {
    const user = await insertUser();
    await authenticateUser(user);
    const response = await request(app)
      .get('/users')
      .set('Authorization', 'blabla');
    expect(response.statusCode).toBe(401);
  });

  test('should list users', async () => {
    const user = await insertUser();
    const loginResponse = await authenticateUser({ ...user, password: '123123123' });
    const token = `Bearer ${extractAuthorizationToken(loginResponse)}`;
    const response = await request(app)
      .get('/users')
      .set('Authorization', token);
    expect(response.statusCode).toBe(200);
  });
});
