# DATABASE SCHEMA DESIGN: Smart Cricket Tournament Tracker

**Course:** Agile Software Development and DevOps Lab (TE AI & DS, Sem V)  
**Database:** MongoDB 7.0+ with Mongoose ODM  
**Version:** 1.0  

---

## 1. Schema Architecture & Design Philosophy

The database schema is engineered with two primary objectives:
1. **Application Performance (Low Latency Reads):** Fast reads for live match scorecards, standings tables, and tournament listings (NFR-1: < 500 ms).
2. **Machine Learning Feature Extraction (LO5):** Clean, indexed extraction of historical player performance (last $N$ matches, strike rates, opposition bowling strength, venue trends) required by the FastAPI ML service and Airflow retraining pipeline.

### Collection Hierarchy & Relationships
```
[Tournament]
   ├── [Team] (1:N)
   │     └── [Player] (1:N)
   └── [Match] (1:N)
         └── [PlayerMatchStat] (1:N per match, 22 records per standard match)
[User] (Independent auth collection)
```

---

## 2. Complete Mongoose Schema Implementations

### 2.1 User Schema (`backend/models/User.js`)
Handles JWT-based administrator authentication, role-based access control, and bcrypt password hashing.

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: ['admin', 'scorer', 'viewer'],
      default: 'admin',
    },
  },
  { timestamps: true }
);

// Pre-save hook: Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Instance method: Verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
```

---

### 2.2 Tournament Schema (`backend/models/Tournament.js`)
Stores overall tournament configurations, formats, venues, and status lifecycle.

```javascript
const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tournament name is required'],
      trim: true,
      index: true,
    },
    format: {
      type: String,
      enum: ['T20', 'ODI', 'TEST'],
      default: 'T20',
      required: true,
    },
    oversPerInnings: {
      type: Number,
      default: 20,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
      index: true,
    },
    rules: {
      pointsForWin: { type: Number, default: 2 },
      pointsForTie: { type: Number, default: 1 },
      pointsForLoss: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tournament', tournamentSchema);
```

---

### 2.3 Team Schema (`backend/models/Team.js`)
Teams participating in a tournament. Holds references to the tournament, captain, and roster metadata.

```javascript
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    shortName: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 5, // e.g., 'MI', 'CSK', 'TSEC'
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
      index: true,
    },
    captainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    },
    logoUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Composite index: A team name should be unique within a tournament
teamSchema.index({ tournamentId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Team', teamSchema);
```

---

### 2.4 Player Schema (`backend/models/Player.js`)
Holds player master data and rolling career summary statistics (denormalized for fast UI display).

```javascript
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Player name is required'],
      trim: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['batsman', 'bowler', 'all-rounder', 'wicket-keeper'],
      required: true,
      index: true,
    },
    battingStyle: {
      type: String,
      enum: ['right-hand', 'left-hand'],
      default: 'right-hand',
    },
    bowlingStyle: {
      type: String,
      enum: ['right-arm-fast', 'right-arm-spin', 'left-arm-fast', 'left-arm-spin', 'none'],
      default: 'none',
    },
    jerseyNumber: {
      type: Number,
    },
    // Denormalized career totals (updated after completed matches)
    careerStats: {
      matches: { type: Number, default: 0 },
      runs: { type: Number, default: 0 },
      ballsFaced: { type: Number, default: 0 },
      strikeRate: { type: Number, default: 0.0 },
      battingAvg: { type: Number, default: 0.0 },
      fifties: { type: Number, default: 0 },
      hundreds: { type: Number, default: 0 },
      highestScore: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      oversBowled: { type: Number, default: 0.0 },
      runsConceded: { type: Number, default: 0 },
      economyRate: { type: Number, default: 0.0 },
      catches: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Player', playerSchema);
```

---

### 2.5 Match Schema (`backend/models/Match.js`)
Handles match lifecycle, real-time live scoring (runs, wickets, overs, current over timeline), and results.

```javascript
const mongoose = require('mongoose');

const inningsScoreSchema = new mongoose.Schema(
  {
    runs: { type: Number, default: 0, min: 0 },
    wickets: { type: Number, default: 0, min: 0, max: 10 },
    overs: { type: Number, default: 0.0, min: 0 }, // e.g., 14.3 overs
    ballsLegal: { type: Number, default: 0 }, // actual legal deliveries count (87 balls = 14.3 overs)
    extras: {
      wides: { type: Number, default: 0 },
      noBalls: { type: Number, default: 0 },
      byes: { type: Number, default: 0 },
      legByes: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
      index: true,
    },
    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    venue: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'completed', 'abandoned'],
      default: 'upcoming',
      index: true,
    },
    toss: {
      winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
      decision: { type: String, enum: ['bat', 'bowl'] },
    },
    currentInnings: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    // Score tracking for both innings
    scoreA: {
      type: inningsScoreSchema,
      default: () => ({}),
    },
    scoreB: {
      type: inningsScoreSchema,
      default: () => ({}),
    },
    // Live active state (for real-time dashboard display)
    liveState: {
      currentOverBalls: [{ type: String }], // e.g., ['1', '4', 'W', '0', '6', '1']
      currentStrikerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
      currentNonStrikerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
      currentBowlerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
      recentBalls: [{ type: String }], // last 12-24 balls for live ticker
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    winMargin: {
      runs: { type: Number },
      wickets: { type: Number },
    },
    resultDescription: {
      type: String,
      default: '', // e.g. "Team A won by 18 runs"
    },
    playerOfMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for common queries
matchSchema.index({ tournamentId: 1, status: 1 });
matchSchema.index({ date: -1 });

module.exports = mongoose.model('Match', matchSchema);
```

---

### 2.6 PlayerMatchStat Schema (`backend/models/PlayerMatchStat.js`)
**The linchpin for both Recharts UI and Machine Learning Feature Engineering.**
Contains atomic per-match per-player performance data.

```javascript
const mongoose = require('mongoose');

const playerMatchStatSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
      index: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      index: true,
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    oppositionTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    matchDate: {
      type: Date,
      required: true,
      index: true,
    },
    venue: {
      type: String,
      required: true,
      index: true,
    },
    // Batting performance
    batting: {
      runs: { type: Number, default: 0, min: 0 },
      ballsFaced: { type: Number, default: 0, min: 0 },
      fours: { type: Number, default: 0, min: 0 },
      sixes: { type: Number, default: 0, min: 0 },
      strikeRate: { type: Number, default: 0.0 },
      battingPosition: { type: Number, default: 0 },
      isDismissed: { type: Boolean, default: false },
      dismissalMode: {
        type: String,
        enum: ['bowled', 'caught', 'lbw', 'run out', 'stumped', 'hit wicket', 'not out'],
        default: 'not out',
      },
    },
    // Bowling performance
    bowling: {
      overs: { type: Number, default: 0.0, min: 0 },
      ballsBowled: { type: Number, default: 0, min: 0 },
      maidens: { type: Number, default: 0, min: 0 },
      runsConceded: { type: Number, default: 0, min: 0 },
      wickets: { type: Number, default: 0, min: 0 },
      economyRate: { type: Number, default: 0.0 },
      dotBalls: { type: Number, default: 0 },
    },
    // Fielding performance
    fielding: {
      catches: { type: Number, default: 0 },
      runOuts: { type: Number, default: 0 },
      stumpings: { type: Number, default: 0 },
    },
    // ML Target Labels
    isPlayerOfMatch: {
      type: Boolean,
      default: false,
    },
    impactScore: {
      type: Number,
      default: 0.0, // Calculated match impact score (Runs*1 + Wickets*25 + Catches*10)
    },
  },
  { timestamps: true }
);

// Pre-save calculation of strike rate and economy rate
playerMatchStatSchema.pre('save', function (next) {
  if (this.batting.ballsFaced > 0) {
    this.batting.strikeRate = Number(
      ((this.batting.runs / this.batting.ballsFaced) * 100).toFixed(2)
    );
  }
  if (this.bowling.ballsBowled > 0) {
    const oversDecimal = this.bowling.ballsBowled / 6;
    this.bowling.economyRate = Number(
      (this.bowling.runsConceded / oversDecimal).toFixed(2)
    );
  }
  this.impactScore =
    this.batting.runs * 1 +
    this.batting.fours * 1 +
    this.batting.sixes * 2 +
    this.bowling.wickets * 25 +
    this.fielding.catches * 10;
  next();
});

// Critical Compound Index: Fast lookups for player's recent matches sorted by date
playerMatchStatSchema.index({ playerId: 1, matchDate: -1 });

// Ensure unique stat per player per match
playerMatchStatSchema.index({ playerId: 1, matchId: 1 }, { unique: true });

module.exports = mongoose.model('PlayerMatchStat', playerMatchStatSchema);
```

---

## 3. How the Schemas Bridge All System Components

### 3.1 Live Standings & Net Run Rate (NRR) Aggregation
The standings table is calculated dynamically from completed matches via a MongoDB Aggregation Pipeline:

$$\text{NRR} = \left( \frac{\text{Total Runs Scored}}{\text{Total Overs Faced}} \right) - \left( \frac{\text{Total Runs Conceded}}{\text{Total Overs Bowled}} \right)$$

```javascript
// Standings aggregation service function
async function calculateTournamentStandings(tournamentId) {
  const matches = await Match.find({
    tournamentId,
    status: 'completed',
  }).lean();

  const standingsMap = {};

  for (const match of matches) {
    const { teamA, teamB, scoreA, scoreB, winner } = match;

    [teamA, teamB].forEach((teamId) => {
      if (!standingsMap[teamId]) {
        standingsMap[teamId] = {
          teamId,
          played: 0,
          won: 0,
          lost: 0,
          tied: 0,
          points: 0,
          runsFor: 0,
          oversFor: 0,
          runsAgainst: 0,
          oversAgainst: 0,
        };
      }
    });

    standingsMap[teamA].played += 1;
    standingsMap[teamB].played += 1;

    standingsMap[teamA].runsFor += scoreA.runs;
    standingsMap[teamA].oversFor += scoreA.ballsLegal / 6;
    standingsMap[teamA].runsAgainst += scoreB.runs;
    standingsMap[teamA].oversAgainst += scoreB.ballsLegal / 6;

    standingsMap[teamB].runsFor += scoreB.runs;
    standingsMap[teamB].oversFor += scoreB.ballsLegal / 6;
    standingsMap[teamB].runsAgainst += scoreA.runs;
    standingsMap[teamB].oversAgainst += scoreA.ballsLegal / 6;

    if (!winner) {
      standingsMap[teamA].tied += 1;
      standingsMap[teamB].tied += 1;
      standingsMap[teamA].points += 1;
      standingsMap[teamB].points += 1;
    } else if (winner.toString() === teamA.toString()) {
      standingsMap[teamA].won += 1;
      standingsMap[teamA].points += 2;
      standingsMap[teamB].lost += 1;
    } else {
      standingsMap[teamB].won += 1;
      standingsMap[teamB].points += 2;
      standingsMap[teamA].lost += 1;
    }
  }

  return Object.values(standingsMap).map((team) => {
    const runRateFor = team.oversFor > 0 ? team.runsFor / team.oversFor : 0;
    const runRateAgainst = team.oversAgainst > 0 ? team.runsAgainst / team.oversAgainst : 0;
    const nrr = Number((runRateFor - runRateAgainst).toFixed(3));
    return { ...team, nrr };
  }).sort((a, b) => b.points - a.points || b.nrr - a.nrr);
}
```

---

### 3.2 Machine Learning Feature Extraction
When `POST /predict/runs` or `POST /predict/pom` is called, the backend queries `PlayerMatchStat` using the compound index:

```javascript
// Example: Extract features for a player before querying FastAPI ML service
async function getPlayerMLFeatures(playerId, oppositionTeamId, venue) {
  // 1. Fetch last 5 matches form
  const recentStats = await PlayerMatchStat.find({ playerId })
    .sort({ matchDate: -1 })
    .limit(5)
    .lean();

  const runsList = recentStats.map(s => s.batting.runs);
  const strikeRateList = recentStats.map(s => s.batting.strikeRate);
  
  const recent_form_avg = runsList.length > 0
    ? runsList.reduce((a, b) => a + b, 0) / runsList.length
    : 15.0; // default baseline

  const recent_strike_rate = strikeRateList.length > 0
    ? strikeRateList.reduce((a, b) => a + b, 0) / strikeRateList.length
    : 110.0;

  // 2. Fetch opposition bowling strength
  const oppBowlingStats = await PlayerMatchStat.find({ oppositionTeamId })
    .limit(30)
    .lean();
  const opp_economy_avg = oppBowlingStats.length > 0
    ? oppBowlingStats.reduce((sum, s) => sum + s.bowling.economyRate, 0) / oppBowlingStats.length
    : 8.5;

  // 3. Fetch venue historical average runs per match
  const venueStats = await Match.find({ venue, status: 'completed' })
    .limit(20)
    .lean();
  const venue_avg_score = venueStats.length > 0
    ? venueStats.reduce((sum, m) => sum + m.scoreA.runs + m.scoreB.runs, 0) / (venueStats.length * 2)
    : 160.0;

  return {
    recent_form_avg,
    recent_strike_rate,
    opp_bowling_strength: opp_economy_avg,
    venue_avg_score,
  };
}
```

---

### 3.3 Kaggle T20 Dataset Integration Strategy
The standard Kaggle T20 dataset (e.g., `matches.csv` and `deliveries.csv` or `t20_matches.csv`) contains:
- `match_id`, `season`, `city`, `date`, `team1`, `team2`, `toss_winner`, `winner`, `player_of_match`, `batsman`, `bowler`, `batsman_runs`, `is_wicket`.

A Python preprocessing script (`ml-service/training/load_kaggle.py`) transforms Kaggle records into the exact `PlayerMatchStat` document structure:
1. Groups deliveries by `(match_id, batsman)` $\rightarrow$ computes runs, balls faced, strike rate, fours, sixes.
2. Groups deliveries by `(match_id, bowler)` $\rightarrow$ computes overs, wickets, runs conceded, economy.
3. Maps Kaggle match dates and teams to tournament documents.
4. Generates an initial seed collection in MongoDB and a unified training parquet file for MLflow and Airflow.
