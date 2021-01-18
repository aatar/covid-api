const { authenticateUser, buyAlbum, extractAuthorizationToken } = require('./utils');
const { insertUser } = require('./factories');

describe('POST /albums/:id', () => {
  test('should buy album', async () => {
    const user = await insertUser();
    const loginResponse = await authenticateUser({ ...user, password: '123123123' });
    const token = `Bearer ${extractAuthorizationToken(loginResponse)}`;
    const response = await buyAlbum(1, token);
    expect(response.statusCode).toBe(201);
  });

  test('should not buy album', async () => {
    const user = await insertUser();
    const loginResponse = await authenticateUser({ ...user, password: '123123123' });
    const token = `Bearer ${extractAuthorizationToken(loginResponse)}`;
    await buyAlbum(1, token);
    const response = await buyAlbum(1, token);
    expect(response.statusCode).toBe(409);
  });
});
