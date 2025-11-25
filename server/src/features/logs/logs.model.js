import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';

const logSchema = new Schema(
  {
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
      required: false,
    },
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    action: { type: String, required: true },
    details: { type: Map, of: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Log = mongoose.model('Log', logSchema);
