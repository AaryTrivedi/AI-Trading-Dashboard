import mongoose from 'mongoose';

export interface IWatchlist {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ticker: string;
  createdAt: Date;
}

const WatchlistSchema = new mongoose.Schema<IWatchlist>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ticker: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Reverse-lookup friendly: list by userId; list by ticker (which users watch this)
WatchlistSchema.index({ userId: 1, ticker: 1 }, { unique: true });
WatchlistSchema.index({ ticker: 1 });

export const Watchlist = mongoose.model<IWatchlist>('Watchlist', WatchlistSchema);
