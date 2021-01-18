const { createAdminUser, authenticateUser, extractAuthorizationToken } = require('./utils');
const { insertUser, insertAdminUser } = require('./factories');

describe('POST /admin/users', () => {
  test('should insert admin user', async () => {
    const adminUser = await insertAdminUser();
    const loginResponse = await authenticateUser({ ...adminUser, password: '123123123' });
    const token = `Bearer ${extractAuthorizationToken(loginResponse)}`;
    const response = await createAdminUser(
      { ...adminUser, email: 'marcos.atar4@wolox.com.ar', password: '123123123' },
      token
    );
    expect(response.statusCode).toBe(201);
  });

  test('should update user to be admin', async () => {
    const user = await insertUser();
    const adminUser = await insertAdminUser();
    const loginResponse = await authenticateUser({ ...adminUser, password: '123123123' });
    const token = `Bearer ${extractAuthorizationToken(loginResponse)}`;
    const response = await createAdminUser(
      { ...user, email: 'marcos.atar3@wolox.com.ar', password: '123123123' },
      token
    );
    expect(response.statusCode).toBe(201);
  });

  test('should not insert admin user', async () => {
    const adminUser = await insertAdminUser();
    const response = await createAdminUser({
      ...adminUser,
      email: 'marcos.atar3@wolox.com.ar',
      password: '123123123'
    });
    expect(response.statusCode).toBe(401);
  });
});
