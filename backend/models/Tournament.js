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
