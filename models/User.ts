import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  email: string;
  name: string;
  image?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  subscription: {
    status: "free" | "pro";
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  integrations: {
    asana?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: Date;
    };
    todoist?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: Date;
    };
  };
  usage: {
    summariesThisMonth: number;
    lastSummaryDate?: Date;
  };
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: String,
    emailVerified: Date,
    subscription: {
      status: {
        type: String,
        enum: ["free", "pro"],
        default: "free",
      },
      stripeCustomerId: String,
      stripeSubscriptionId: String,
    },
    integrations: {
      asana: {
        accessToken: String,
        refreshToken: String,
        expiresAt: Date,
      },
      todoist: {
        accessToken: String,
        refreshToken: String,
        expiresAt: Date,
      },
    },
    usage: {
      summariesThisMonth: {
        type: Number,
        default: 0,
      },
      lastSummaryDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
