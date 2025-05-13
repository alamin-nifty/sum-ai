import mongoose from "mongoose";

export interface ISummary extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  originalText: string;
  summary: string;
  tasks: string[];
  source: "gmail" | "slack" | "teams" | "other";
  metadata: {
    threadId?: string;
    messageId?: string;
    channelId?: string;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SummarySchema = new mongoose.Schema<ISummary>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalText: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    tasks: [
      {
        type: String,
      },
    ],
    source: {
      type: String,
      enum: ["gmail", "slack", "teams", "other"],
      required: true,
    },
    metadata: {
      threadId: String,
      messageId: String,
      channelId: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
SummarySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Summary ||
  mongoose.model<ISummary>("Summary", SummarySchema);
