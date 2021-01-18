const { authenticateUser } = require('./utils');
const { insertUser } = require('./factories');

describe('POST /users/sessions', () => {
  test('should login', async () => {
    const user = await insertUser();
    const response = await authenticateUser({ ...user, password: '123123123' });
    expect(response.statusCode).toBe(200);
  });

  test('incorrect email', async () => {
    const user = await insertUser();
    const modifiedUser = { ...user, email: 'marcos.atar32@wolox.com.ar', password: '123123123' };
    const response = await authenticateUser(modifiedUser);

    expect(response.statusCode).toBe(401);
  });

  test('incorrect password', async () => {
    const user = await insertUser();
    const modifiedUser = { ...user, password: '1231231234' };
    const response = await authenticateUser(modifiedUser);
    expect(response.statusCode).toBe(401);
  });
});
