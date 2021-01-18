const { createUser, user } = require('./utils');
const { insertUser } = require('./factories');

describe('POST /users', () => {
  test('already used email', async () => {
    const userFG = await insertUser();
    const response = await createUser({ ...userFG, password: '123123123' });
    expect(response.statusCode).toBe(409);
  });

  test('password is not valid', async () => {
    const modifiedUser = { ...user, password: '121212' };
    const response = await createUser(modifiedUser);
    expect(response.statusCode).toBe(422);
  });

  test('email is not valid', async () => {
    const modifiedUser = { ...user, email: 'marcos.atar@woleox.com.ar', password: '123123123' };
    const response = await createUser(modifiedUser);
    expect(response.statusCode).toBe(422);
  });

  test('arguments missing', async () => {
    const response = await createUser({ email: 'blabla@wolox.com.ar' });
    expect(response.statusCode).toBe(422);
  });
});
