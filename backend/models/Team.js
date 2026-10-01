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
      maxlength: 6,
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
      index: true,
    },
    captainName: {
      type: String,
      default: '',
    },
    logoUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

teamSchema.index({ tournamentId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Team', teamSchema);
