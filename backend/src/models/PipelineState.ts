import mongoose from 'mongoose';

export interface IPipelineState {
  _id: string;
  value: Date;
}

const PipelineStateSchema = new mongoose.Schema<IPipelineState>(
  {
    _id: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Date,
      required: true,
    },
  },
  {
    collection: 'pipeline_state',
    versionKey: false,
    timestamps: false,
  }
);

export const PipelineState = mongoose.model<IPipelineState>('PipelineState', PipelineStateSchema);
