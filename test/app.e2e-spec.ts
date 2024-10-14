import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let createdNoteId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  jest.setTimeout(10000);  // Increase timeout to 10 seconds if needed

  // User Registration
  it('POST /users/register - should register a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/register')
      .send({
        username: 'testuser',
        password: 'testpassword',
        email: 'testuser@example.com',
      })
      .expect(201);

    expect(response.body.user.username).toEqual('testuser');
  });

  // User Login and Set JWT in Cookies
  it('POST /auth/login - should login and set JWT token in cookies', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'testpassword',
      })
      .expect(201);

    // Extract the JWT token from the cookies
    const cookies = response.headers['set-cookie'];
    console.log(cookies);
    expect(cookies).toBeDefined();
    expect(cookies.length).toBeGreaterThan(0);

    // Extract JWT token from cookies
    jwtToken = cookies[0].split(';')[0];
    expect(jwtToken).toBeDefined();
  });

  // Get User Profile
  it('GET /users/profile - should get the user profile', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/profile')
      .set('Cookie', jwtToken)  // Set JWT token in cookies
      .expect(200);

    expect(response.body.username).toEqual('testuser');
    expect(response.body.email).toEqual('testuser@example.com');
  });

  // Create a Note
  it('POST /notes/create - should create a new note', async () => {
    const response = await request(app.getHttpServer())
      .post('/notes/create')
      .set('Cookie', jwtToken)  // Set JWT token in cookies
      .send({
        title: 'My First Note',
        content: 'This is a note created for testing.',
      })
      .expect(201);

    expect(response.body.title).toEqual('My First Note');
    createdNoteId = response.body._id;  // Save the note ID for later tests
  });

  // Get All Notes
  it('GET /notes - should retrieve all notes for the user', async () => {
    const response = await request(app.getHttpServer())
      .get('/notes')
      .set('Cookie', jwtToken)  // Set JWT token in cookies
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // Get Note by ID
  it(`GET /notes/:id - should retrieve the created note by ID`, async () => {
    const response = await request(app.getHttpServer())
      .get(`/notes/${createdNoteId}`)
      .set('Cookie', jwtToken)  // Set JWT token in cookies
      .expect(200);

    expect(response.body.title).toEqual('My First Note');
    expect(response.body._id).toEqual(createdNoteId);
  });

  // Update a Note
  it(`PUT /notes/:id - should update the note`, async () => {
    const response = await request(app.getHttpServer())
      .put(`/notes/${createdNoteId}`)
      .set('Cookie', jwtToken)  // Set JWT token in cookies
      .send({
        title: 'Updated Note Title',
        content: 'Updated note content.',
      })
      .expect(200);

    expect(response.body.title).toEqual('Updated Note Title');
    expect(response.body.content).toEqual('Updated note content.');
  });

  // Delete a Note
  it(`DELETE /notes/:id - should delete the note`, async () => {
    await request(app.getHttpServer())
      .delete(`/notes/${createdNoteId}`)
      .set('Cookie', jwtToken)  // Set JWT token in cookies
      .expect(200);

    // Verify the note has been deleted
    await request(app.getHttpServer())
      .get(`/notes/${createdNoteId}`)
      .set('Cookie', jwtToken)  // Set JWT token in cookies
      .expect(404);
  });

  // Logout
  it('DELETE /auth/logout - should clear the auth cookie', async () => {
    const response = await request(app.getHttpServer())
      .delete('/auth/logout')
      .set('Cookie', jwtToken)  // Set JWT token in cookies
      .expect(200);

    expect(response.body.message).toEqual('Logout successful');
  });
});
