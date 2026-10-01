const request = require('supertest');
const { app } = require('../server');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');

jest.mock('../models/Match');
jest.mock('../models/Tournament');
jest.mock('../models/Team');

describe('Match & Standings Endpoints (Unit Tests)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/matches', () => {
    it('should return all matches populated with teams', async () => {
      const mockMatches = [
        {
          _id: 'match1',
          venue: 'Wankhede Stadium',
          status: 'completed',
          scoreA: { runs: 180, wickets: 4, overs: 20 },
          scoreB: { runs: 165, wickets: 8, overs: 20 },
        },
      ];

      Match.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockMatches),
              }),
            }),
          }),
        }),
      });

      const res = await request(app).get('/api/matches');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].venue).toBe('Wankhede Stadium');
    });
  });

  describe('GET /api/matches/live', () => {
    it('should return currently active live matches', async () => {
      const mockLive = [
        {
          _id: 'live1',
          status: 'live',
          scoreA: { runs: 140, wickets: 3, overs: 16.2 },
        },
      ];

      Match.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockLive),
          }),
        }),
      });

      const res = await request(app).get('/api/matches/live');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /metrics Prometheus endpoint', () => {
    it('should expose metrics in Prometheus exposition text format', async () => {
      const res = await request(app).get('/metrics');
      expect(res.statusCode).toEqual(200);
      expect(res.text).toContain('cricket_backend_');
      expect(res.text).toContain('cricket_http_requests_total');
    });
  });
});
