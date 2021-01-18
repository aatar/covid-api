const request = require('supertest');
const app = require('../app');

exports.createUser = user =>
  request(app)
    .post('/users')
    .send(user)
    .set('Accept', 'application/json');

exports.createAdminUser = (user, token = null) =>
  request(app)
    .post('/admin/users')
    .send(user)
    .set('Accept', 'application/json')
    .set('Authorization', token);

exports.authenticateUser = user =>
  request(app)
    .post('/users/sessions')
    .send(user)
    .set('Accept', 'application/json');

exports.disableAllSessions = token =>
  request(app)
    .post('/users/sessions/invalidate_all')
    .set('Accept', 'application/json')
    .set('Authorization', token);

exports.buyAlbum = (album, token) =>
  request(app)
    .post(`/albums/${album}`)
    .set('Accept', 'application/json')
    .set('Authorization', token);

exports.listBoughtAlbums = (userId, token) =>
  request(app)
    .get(`/users/${userId}/albums`)
    .set('Accept', 'application/json')
    .set('Authorization', token);

exports.listPhotosBoughtAlbum = (albumId, token) =>
  request(app)
    .get(`/users/albums/${albumId}/photos`)
    .set('Accept', 'application/json')
    .set('Authorization', token);

exports.user = {
  name: 'Ariel',
  surname: 'Atar',
  email: 'marcos.atar2@wolox.com.ar',
  password: '123123123',
  admin: false
};

exports.extractAuthorizationToken = serverResponse =>
  serverResponse &&
  serverResponse.headers &&
  serverResponse.headers.authorization &&
  serverResponse.headers.authorization.substring(8);
