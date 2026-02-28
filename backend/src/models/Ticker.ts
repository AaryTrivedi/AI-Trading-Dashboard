import mongoose from 'mongoose';

export interface ITicker {
  _id: mongoose.Types.ObjectId;
  ticker: string;
  name?: string;
  exchange?: string;
  createdAt: Date;
}

const TickerSchema = new mongoose.Schema<ITicker>(
  {
    ticker: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      default: undefined,
    },
    exchange: {
      type: String,
      default: undefined,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

TickerSchema.index({ ticker: 1 }, { unique: true });

export const Ticker = mongoose.model<ITicker>('Ticker', TickerSchema);
