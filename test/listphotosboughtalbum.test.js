const { authenticateUser, listPhotosBoughtAlbum, buyAlbum } = require('./utils');
const { insertUser } = require('./factories');

describe('GET /users/albums/:id/photos', () => {
  test('should list photos', async () => {
    const user = await insertUser();
    const loginResponse = await authenticateUser({ ...user, password: '123123123' });
    const token = `Bearer ${loginResponse.headers.authorization.substring(8)}`;
    await buyAlbum(1, token);
    const response = await listPhotosBoughtAlbum(1, token);
    expect(response.statusCode).toBe(200);
  });

  test('should not list photos', async () => {
    const user = await insertUser();
    const loginResponse = await authenticateUser({ ...user, password: '123123123' });
    const token = `Bearer ${loginResponse.headers.authorization.substring(8)}`;
    await buyAlbum(1, token);
    const response = await listPhotosBoughtAlbum(2, token);
    expect(response.statusCode).toBe(409);
  });
});
