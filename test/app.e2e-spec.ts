import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';  // Correct import for cookie-parser

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authToken: string; // Store the complete cookie string
  let createdNoteId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());  // Use cookie-parser middleware
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

    // Extract the Set-Cookie header (it could be a single string or an array)
    const cookies = response.headers['set-cookie'];

    console.log('Cookies:', cookies); // Log cookies for debugging

    // If `cookies` is an array, we'll find the `auth_token` cookie; if it's a string, we'll use it directly
    if (Array.isArray(cookies)) {
      authToken = cookies.find((cookie: string) => cookie.startsWith('auth_token='));
    } else {
      authToken = cookies;  // Handle the case when it's just a string
    }

    expect(authToken).toBeDefined();
    console.log('Extracted auth_token:', authToken);
  });

  // Get User Profile
  it('GET /users/profile - should get the user profile', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/profile')
      .set('Cookie', authToken)  // Use the complete 'auth_token=...' cookie
      .expect(200);
      
    expect(response.body.user.username).toEqual('testuser');
    expect(response.body.user.email).toEqual('testuser@example.com');
  });

  // Create a Note
  it('POST /notes/create - should create a new note', async () => {
    const response = await request(app.getHttpServer())
      .post('/notes/create')
      .set('Cookie', authToken)  // Use the complete 'auth_token=...' cookie
      .send({
        title: 'My First Note',
        content: 'This is a note created for testing.',
      })
      .expect(201);

    expect(response.body.newNote.title).toEqual('My First Note');
    createdNoteId = response.body.newNote._id;  // Save the note ID for later tests
  });

  // Get All Notes
  it('GET /notes - should retrieve all notes for the user', async () => {
    const response = await request(app.getHttpServer())
      .get('/notes')
      .set('Cookie', authToken)  // Use the complete 'auth_token=...' cookie
      .expect(200);
    
    expect(Array.isArray(response.body.notes)).toBe(true);
    expect(response.body.notes.length).toBeGreaterThan(0);
  });

  // Get Note by ID
  it(`GET /notes/:id - should retrieve the created note by ID`, async () => {
    const response = await request(app.getHttpServer())
      .get(`/notes/${createdNoteId}`)
      .set('Cookie', authToken)  // Use the complete 'auth_token=...' cookie
      .expect(200);
    
    expect(response.body.note.title).toEqual('My First Note');
    expect(response.body.note._id).toEqual(createdNoteId);
  });

  // Update a Note
  it(`PUT /notes/:id - should update the note`, async () => {
    const response = await request(app.getHttpServer())
      .put(`/notes/${createdNoteId}`)
      .set('Cookie', authToken)  // Use the complete 'auth_token=...' cookie
      .send({
        title: 'Updated Note Title',
        content: 'Updated note content.',
      })
      .expect(200);

    expect(response.body.updatedNote.title).toEqual('Updated Note Title');
    expect(response.body.updatedNote.content).toEqual('Updated note content.');
  });

  // Delete a Note
  it(`DELETE /notes/:id - should delete the note`, async () => {
    await request(app.getHttpServer())
      .delete(`/notes/${createdNoteId}`)
      .set('Cookie', authToken)  // Use the complete 'auth_token=...' cookie
      .expect(200);

    // Verify the note has been deleted
    await request(app.getHttpServer())
      .get(`/notes/${createdNoteId}`)
      .set('Cookie', authToken)  // Use the complete 'auth_token=...' cookie
      .expect(404);
  });

  // Logout
  it('DELETE /auth/logout - should clear the auth cookie', async () => {
    const response = await request(app.getHttpServer())
      .delete('/auth/logout')
      .set('Cookie', authToken)  // Use the complete 'auth_token=...' cookie
      .expect(200);

    expect(response.body.message).toEqual('Logout successful');
  });
});
