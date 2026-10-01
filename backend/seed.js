const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Tournament = require('./models/Tournament');
const Team = require('./models/Team');
const Player = require('./models/Player');
const Match = require('./models/Match');
const PlayerMatchStat = require('./models/PlayerMatchStat');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cricket_tracker';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB at', MONGO_URI);

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Tournament.deleteMany({}),
      Team.deleteMany({}),
      Player.deleteMany({}),
      Match.deleteMany({}),
      PlayerMatchStat.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing database collections');

    // 1. Create Default Admin User
    const adminUser = await User.create({
      name: 'Tournament Chief Admin',
      email: 'admin@cricket.org',
      passwordHash: 'admin123',
      role: 'admin',
    });
    console.log('[Seed] Admin user created: admin@cricket.org / admin123');

    // 2. Create Tournament
    const tournament = await Tournament.create({
      name: 'Mumbai Premier T20 Cup 2026',
      format: 'T20',
      oversPerInnings: 20,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-04-15'),
      venue: 'Wankhede Stadium, Mumbai',
      status: 'ongoing',
      rules: { pointsForWin: 2, pointsForTie: 1, pointsForLoss: 0 },
    });
    console.log(`[Seed] Tournament created: ${tournament.name}`);

    // 3. Create Teams
    const teamsData = [
      { name: 'Bandra Blasters', shortName: 'BBL', tournamentId: tournament._id, captainName: 'Rohit Sharma' },
      { name: 'Marine Drive Mavericks', shortName: 'MDM', tournamentId: tournament._id, captainName: 'Virat Kohli' },
      { name: 'Shivaji Park Strikers', shortName: 'SPS', tournamentId: tournament._id, captainName: 'Surya Yadav' },
      { name: 'Andheri Aces', shortName: 'AAC', tournamentId: tournament._id, captainName: 'Hardik Pandya' },
    ];
    const teams = await Team.insertMany(teamsData);
    console.log(`[Seed] Created ${teams.length} teams`);

    const [teamBandra, teamMarine, teamShivaji, teamAndheri] = teams;

    // 4. Create Players for each team
    const playersData = [
      // Bandra Blasters
      { name: 'Rohit Varma', teamId: teamBandra._id, role: 'batsman', battingStyle: 'right-hand', bowlingStyle: 'right-arm-spin', jerseyNumber: 45, careerStats: { matches: 28, runs: 940, strikeRate: 142.5, battingAvg: 39.1, fifties: 7, highestScore: 89, wickets: 4 } },
      { name: 'Ishan Merchant', teamId: teamBandra._id, role: 'wicket-keeper', battingStyle: 'left-hand', bowlingStyle: 'none', jerseyNumber: 23, careerStats: { matches: 25, runs: 670, strikeRate: 135.2, battingAvg: 30.4, fifties: 4, highestScore: 72, catches: 18 } },
      { name: 'Jasprit Bumrah-Shah', teamId: teamBandra._id, role: 'bowler', battingStyle: 'right-hand', bowlingStyle: 'right-arm-fast', jerseyNumber: 93, careerStats: { matches: 30, runs: 58, wickets: 42, economyRate: 6.85, bowlingStyle: 'right-arm-fast' } },
      { name: 'Krunal Patel', teamId: teamBandra._id, role: 'all-rounder', battingStyle: 'left-hand', bowlingStyle: 'left-arm-spin', jerseyNumber: 24, careerStats: { matches: 26, runs: 420, strikeRate: 128.0, battingAvg: 23.3, wickets: 22, economyRate: 7.4 } },
      { name: 'Piyush Chawla-Rao', teamId: teamBandra._id, role: 'bowler', battingStyle: 'left-hand', bowlingStyle: 'right-arm-spin', jerseyNumber: 11, careerStats: { matches: 24, wickets: 31, economyRate: 7.8 } },

      // Marine Drive Mavericks
      { name: 'Vikram Kohli', teamId: teamMarine._id, role: 'batsman', battingStyle: 'right-hand', bowlingStyle: 'none', jerseyNumber: 18, careerStats: { matches: 32, runs: 1240, strikeRate: 138.8, battingAvg: 47.6, fifties: 11, hundreds: 1, highestScore: 104, catches: 15 } },
      { name: 'Faf Du Plessis-Nair', teamId: teamMarine._id, role: 'batsman', battingStyle: 'right-hand', bowlingStyle: 'none', jerseyNumber: 13, careerStats: { matches: 30, runs: 980, strikeRate: 136.5, battingAvg: 36.2, fifties: 8, highestScore: 84 } },
      { name: 'Glenn Maxwell-Deshmukh', teamId: teamMarine._id, role: 'all-rounder', battingStyle: 'right-hand', bowlingStyle: 'right-arm-spin', jerseyNumber: 32, careerStats: { matches: 29, runs: 710, strikeRate: 158.4, battingAvg: 28.4, wickets: 18, economyRate: 8.2 } },
      { name: 'Mohammed Siraj-Khan', teamId: teamMarine._id, role: 'bowler', battingStyle: 'right-hand', bowlingStyle: 'right-arm-fast', jerseyNumber: 73, careerStats: { matches: 27, runs: 32, wickets: 36, economyRate: 7.9 } },
      { name: 'Dinesh Karthik-Iyer', teamId: teamMarine._id, role: 'wicket-keeper', battingStyle: 'right-hand', bowlingStyle: 'none', jerseyNumber: 19, careerStats: { matches: 31, runs: 590, strikeRate: 152.1, battingAvg: 26.8, catches: 22 } },

      // Shivaji Park Strikers
      { name: 'Surya Pratap Yadav', teamId: teamShivaji._id, role: 'batsman', battingStyle: 'right-hand', bowlingStyle: 'right-arm-spin', jerseyNumber: 63, careerStats: { matches: 31, runs: 1180, strikeRate: 164.2, battingAvg: 43.7, fifties: 10, hundreds: 2, highestScore: 112 } },
      { name: 'Tilak Varma-Jain', teamId: teamShivaji._id, role: 'batsman', battingStyle: 'left-hand', bowlingStyle: 'right-arm-spin', jerseyNumber: 9, careerStats: { matches: 22, runs: 640, strikeRate: 139.0, battingAvg: 35.5, fifties: 5, highestScore: 84 } },
      { name: 'Trent Boult-Mehta', teamId: teamShivaji._id, role: 'bowler', battingStyle: 'right-hand', bowlingStyle: 'left-arm-fast', jerseyNumber: 18, careerStats: { matches: 28, wickets: 38, economyRate: 7.3 } },
      { name: 'Yuzvendra Chahal-Kapoor', teamId: teamShivaji._id, role: 'bowler', battingStyle: 'right-hand', bowlingStyle: 'right-arm-spin', jerseyNumber: 3, careerStats: { matches: 33, wickets: 45, economyRate: 7.6 } },

      // Andheri Aces
      { name: 'Hardik Dave Pandya', teamId: teamAndheri._id, role: 'all-rounder', battingStyle: 'right-hand', bowlingStyle: 'right-arm-fast', jerseyNumber: 33, careerStats: { matches: 29, runs: 750, strikeRate: 146.5, battingAvg: 31.2, wickets: 25, economyRate: 8.4 } },
      { name: 'Shubman Gill-Reddy', teamId: teamAndheri._id, role: 'batsman', battingStyle: 'right-hand', bowlingStyle: 'none', jerseyNumber: 77, careerStats: { matches: 27, runs: 1020, strikeRate: 141.2, battingAvg: 44.3, fifties: 9, hundreds: 1, highestScore: 101 } },
      { name: 'Rashid Khan-Ansari', teamId: teamAndheri._id, role: 'all-rounder', battingStyle: 'right-hand', bowlingStyle: 'right-arm-spin', jerseyNumber: 19, careerStats: { matches: 34, runs: 390, strikeRate: 154.0, wickets: 49, economyRate: 6.45 } },
      { name: 'David Miller-Soni', teamId: teamAndheri._id, role: 'batsman', battingStyle: 'left-hand', bowlingStyle: 'none', jerseyNumber: 10, careerStats: { matches: 28, runs: 680, strikeRate: 145.0, battingAvg: 37.7, fifties: 4 } },
    ];
    const players = await Player.insertMany(playersData);
    console.log(`[Seed] Created ${players.length} players across teams`);

    const playerMap = {};
    players.forEach((p) => {
      playerMap[p.name] = p;
    });

    // 5. Create Completed Matches with realistic innings stats
    const match1 = await Match.create({
      tournamentId: tournament._id,
      teamA: teamBandra._id,
      teamB: teamMarine._id,
      date: new Date('2026-03-05'),
      venue: 'Wankhede Stadium, Mumbai',
      status: 'completed',
      toss: { winner: teamBandra._id, decision: 'bat' },
      currentInnings: 2,
      scoreA: { runs: 186, wickets: 5, overs: 20.0, ballsLegal: 120, extras: { wides: 6, noBalls: 1, byes: 2, legByes: 1 } },
      scoreB: { runs: 172, wickets: 8, overs: 20.0, ballsLegal: 120, extras: { wides: 4, noBalls: 0, byes: 1, legByes: 3 } },
      winner: teamBandra._id,
      winMargin: '14 runs',
      resultDescription: 'Bandra Blasters won by 14 runs',
      playerOfMatch: playerMap['Rohit Varma']._id,
    });

    const match2 = await Match.create({
      tournamentId: tournament._id,
      teamA: teamShivaji._id,
      teamB: teamAndheri._id,
      date: new Date('2026-03-08'),
      venue: 'DY Patil Stadium, Navi Mumbai',
      status: 'completed',
      toss: { winner: teamAndheri._id, decision: 'bowl' },
      currentInnings: 2,
      scoreA: { runs: 198, wickets: 4, overs: 20.0, ballsLegal: 120, extras: { wides: 5, noBalls: 2, byes: 0, legByes: 2 } },
      scoreB: { runs: 199, wickets: 6, overs: 19.4, ballsLegal: 118, extras: { wides: 8, noBalls: 1, byes: 4, legByes: 1 } },
      winner: teamAndheri._id,
      winMargin: '4 wickets',
      resultDescription: 'Andheri Aces won by 4 wickets (2 balls remaining)',
      playerOfMatch: playerMap['Hardik Dave Pandya']._id,
    });

    const match3 = await Match.create({
      tournamentId: tournament._id,
      teamA: teamMarine._id,
      teamB: teamShivaji._id,
      date: new Date('2026-03-12'),
      venue: 'Brabourne Stadium, Mumbai',
      status: 'completed',
      toss: { winner: teamMarine._id, decision: 'bat' },
      currentInnings: 2,
      scoreA: { runs: 175, wickets: 7, overs: 20.0, ballsLegal: 120, extras: { wides: 4, noBalls: 1, byes: 0, legByes: 2 } },
      scoreB: { runs: 176, wickets: 3, overs: 18.2, ballsLegal: 110, extras: { wides: 6, noBalls: 0, byes: 1, legByes: 1 } },
      winner: teamShivaji._id,
      winMargin: '7 wickets',
      resultDescription: 'Shivaji Park Strikers won by 7 wickets',
      playerOfMatch: playerMap['Surya Pratap Yadav']._id,
    });

    const match4 = await Match.create({
      tournamentId: tournament._id,
      teamA: teamAndheri._id,
      teamB: teamBandra._id,
      date: new Date('2026-03-16'),
      venue: 'Wankhede Stadium, Mumbai',
      status: 'completed',
      toss: { winner: teamBandra._id, decision: 'bowl' },
      currentInnings: 2,
      scoreA: { runs: 164, wickets: 9, overs: 20.0, ballsLegal: 120, extras: { wides: 5, noBalls: 0, byes: 2, legByes: 2 } },
      scoreB: { runs: 168, wickets: 4, overs: 18.5, ballsLegal: 113, extras: { wides: 4, noBalls: 1, byes: 0, legByes: 1 } },
      winner: teamBandra._id,
      winMargin: '6 wickets',
      resultDescription: 'Bandra Blasters won by 6 wickets',
      playerOfMatch: playerMap['Jasprit Bumrah-Shah']._id,
    });

    console.log('[Seed] Created 4 completed matches');

    // 6. Create 1 LIVE match with real-time scoring data
    const liveMatch = await Match.create({
      tournamentId: tournament._id,
      teamA: teamMarine._id,
      teamB: teamAndheri._id,
      date: new Date(),
      venue: 'Wankhede Stadium, Mumbai',
      status: 'live',
      toss: { winner: teamMarine._id, decision: 'bat' },
      currentInnings: 2,
      battingFirst: teamMarine._id,
      scoreA: { runs: 182, wickets: 6, overs: 20.0, ballsLegal: 120, extras: { wides: 5, noBalls: 1, byes: 1, legByes: 2 } },
      scoreB: { runs: 134, wickets: 3, overs: 14.2, ballsLegal: 86, extras: { wides: 4, noBalls: 0, byes: 2, legByes: 1 } },
      liveState: {
        currentOverBalls: ['1', '4', '0', '2', 'W'],
        recentBalls: ['1', '4', '0', '2', 'W', '6', '1', '2', '4', '0', '1', '1'],
        strikerName: 'Hardik Dave Pandya',
        strikerRuns: 38,
        strikerBalls: 22,
        nonStrikerName: 'David Miller-Soni',
        nonStrikerRuns: 19,
        nonStrikerBalls: 14,
        bowlerName: 'Mohammed Siraj-Khan',
        bowlerOvers: 3.2,
        bowlerRuns: 27,
        bowlerWickets: 2,
      },
    });
    console.log('[Seed] Created 1 LIVE match with active scorecard');

    // 7. Create 1 Upcoming match
    await Match.create({
      tournamentId: tournament._id,
      teamA: teamBandra._id,
      teamB: teamShivaji._id,
      date: new Date(Date.now() + 86400000 * 2), // 2 days later
      venue: 'Wankhede Stadium, Mumbai',
      status: 'upcoming',
      toss: { decision: 'bat' },
    });

    // 8. Populate PlayerMatchStat historical records (for Recharts form & ML features)
    const statsRecords = [
      // Rohit Varma recent matches
      { playerId: playerMap['Rohit Varma']._id, matchId: match1._id, tournamentId: tournament._id, teamId: teamBandra._id, oppositionTeamId: teamMarine._id, matchDate: new Date('2026-03-05'), venue: 'Wankhede Stadium, Mumbai', batting: { runs: 74, ballsFaced: 48, fours: 7, sixes: 4, strikeRate: 154.17 }, bowling: { overs: 0, ballsBowled: 0, runsConceded: 0, wickets: 0 }, isPlayerOfMatch: true },
      { playerId: playerMap['Rohit Varma']._id, matchId: match4._id, tournamentId: tournament._id, teamId: teamBandra._id, oppositionTeamId: teamAndheri._id, matchDate: new Date('2026-03-16'), venue: 'Wankhede Stadium, Mumbai', batting: { runs: 56, ballsFaced: 36, fours: 6, sixes: 2, strikeRate: 155.56 }, bowling: { overs: 0, ballsBowled: 0, runsConceded: 0, wickets: 0 }, isPlayerOfMatch: false },
      
      // Vikram Kohli recent matches
      { playerId: playerMap['Vikram Kohli']._id, matchId: match1._id, tournamentId: tournament._id, teamId: teamMarine._id, oppositionTeamId: teamBandra._id, matchDate: new Date('2026-03-05'), venue: 'Wankhede Stadium, Mumbai', batting: { runs: 62, ballsFaced: 44, fours: 5, sixes: 2, strikeRate: 140.91 }, bowling: { overs: 0, ballsBowled: 0, runsConceded: 0, wickets: 0 }, isPlayerOfMatch: false },
      { playerId: playerMap['Vikram Kohli']._id, matchId: match3._id, tournamentId: tournament._id, teamId: teamMarine._id, oppositionTeamId: teamShivaji._id, matchDate: new Date('2026-03-12'), venue: 'Brabourne Stadium, Mumbai', batting: { runs: 82, ballsFaced: 52, fours: 8, sixes: 3, strikeRate: 157.69 }, bowling: { overs: 0, ballsBowled: 0, runsConceded: 0, wickets: 0 }, isPlayerOfMatch: false },

      // Surya Pratap Yadav recent matches
      { playerId: playerMap['Surya Pratap Yadav']._id, matchId: match2._id, tournamentId: tournament._id, teamId: teamShivaji._id, oppositionTeamId: teamAndheri._id, matchDate: new Date('2026-03-08'), venue: 'DY Patil Stadium, Navi Mumbai', batting: { runs: 88, ballsFaced: 42, fours: 9, sixes: 5, strikeRate: 209.52 }, bowling: { overs: 0, ballsBowled: 0, runsConceded: 0, wickets: 0 }, isPlayerOfMatch: false },
      { playerId: playerMap['Surya Pratap Yadav']._id, matchId: match3._id, tournamentId: tournament._id, teamId: teamShivaji._id, oppositionTeamId: teamMarine._id, matchDate: new Date('2026-03-12'), venue: 'Brabourne Stadium, Mumbai', batting: { runs: 71, ballsFaced: 38, fours: 7, sixes: 4, strikeRate: 186.84 }, bowling: { overs: 0, ballsBowled: 0, runsConceded: 0, wickets: 0 }, isPlayerOfMatch: true },

      // Hardik Dave Pandya recent matches
      { playerId: playerMap['Hardik Dave Pandya']._id, matchId: match2._id, tournamentId: tournament._id, teamId: teamAndheri._id, oppositionTeamId: teamShivaji._id, matchDate: new Date('2026-03-08'), venue: 'DY Patil Stadium, Navi Mumbai', batting: { runs: 52, ballsFaced: 28, fours: 4, sixes: 3, strikeRate: 185.71 }, bowling: { overs: 4, ballsBowled: 24, runsConceded: 32, wickets: 2, economyRate: 8.0 }, isPlayerOfMatch: true },
      { playerId: playerMap['Hardik Dave Pandya']._id, matchId: match4._id, tournamentId: tournament._id, teamId: teamAndheri._id, oppositionTeamId: teamBandra._id, matchDate: new Date('2026-03-16'), venue: 'Wankhede Stadium, Mumbai', batting: { runs: 28, ballsFaced: 19, fours: 2, sixes: 1, strikeRate: 147.37 }, bowling: { overs: 4, ballsBowled: 24, runsConceded: 36, wickets: 1, economyRate: 9.0 }, isPlayerOfMatch: false },

      // Jasprit Bumrah-Shah recent matches
      { playerId: playerMap['Jasprit Bumrah-Shah']._id, matchId: match1._id, tournamentId: tournament._id, teamId: teamBandra._id, oppositionTeamId: teamMarine._id, matchDate: new Date('2026-03-05'), venue: 'Wankhede Stadium, Mumbai', batting: { runs: 2, ballsFaced: 3 }, bowling: { overs: 4, ballsBowled: 24, maidens: 1, runsConceded: 21, wickets: 3, economyRate: 5.25 }, isPlayerOfMatch: false },
      { playerId: playerMap['Jasprit Bumrah-Shah']._id, matchId: match4._id, tournamentId: tournament._id, teamId: teamBandra._id, oppositionTeamId: teamAndheri._id, matchDate: new Date('2026-03-16'), venue: 'Wankhede Stadium, Mumbai', batting: { runs: 0, ballsFaced: 0 }, bowling: { overs: 4, ballsBowled: 24, maidens: 0, runsConceded: 18, wickets: 4, economyRate: 4.5 }, isPlayerOfMatch: true },
    ];

    for (const stat of statsRecords) {
      await PlayerMatchStat.create(stat);
    }
    console.log(`[Seed] Seeded ${statsRecords.length} PlayerMatchStat records`);

    console.log('\n=============================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY! ');
    console.log(' Tournament ID:', tournament._id.toString());
    console.log(' Live Match ID:', liveMatch._id.toString());
    console.log(' Login Credentials: admin@cricket.org / admin123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
