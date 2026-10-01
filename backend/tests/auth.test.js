const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');

// Mock User model to allow deterministic, fast unit testing in CI without live MongoDB
jest.mock('../models/User');

describe('Auth Endpoints (Unit Tests)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a JWT token', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        name: 'Scorer Test',
        email: 'scorer@cricket.org',
        role: 'scorer',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Scorer Test',
          email: 'scorer@cricket.org',
          password: 'password123',
          role: 'scorer',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toEqual('scorer@cricket.org');
    });

    it('should return 400 if user email already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'existing@cricket.org' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Existing User',
          email: 'existing@cricket.org',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Incomplete' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user and return token on valid credentials', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Admin User',
        email: 'admin@cricket.org',
        role: 'admin',
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@cricket.org',
          password: 'correctpassword',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toEqual('admin');
    });

    it('should reject login with 401 on wrong password', async () => {
      const mockUser = {
        email: 'admin@cricket.org',
        matchPassword: jest.fn().mockResolvedValue(false),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@cricket.org',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });
  });

  describe('GET /health probe', () => {
    it('should return healthy status for k8s probes', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('healthy');
      expect(res.body.service).toEqual('cricket-tracker-backend');
    });
  });
});
