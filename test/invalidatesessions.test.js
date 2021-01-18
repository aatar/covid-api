const request = require('supertest');
const app = require('../app');
const { authenticateUser, disableAllSessions } = require('./utils');
const { insertUser } = require('./factories');

describe('POST /users/sessions/invalidate_all', () => {
  test('should not list users', async () => {
    const user = await insertUser();
    const loginResponse = await authenticateUser({ ...user, password: '123123123' });
    const token = `Bearer ${loginResponse.headers.authorization.substring(8)}`;
    await disableAllSessions(token);
    const response = await request(app)
      .get('/users')
      .set('Authorization', token);
    expect(response.statusCode).toBe(401);
  });
});
