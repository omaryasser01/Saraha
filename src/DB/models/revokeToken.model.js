import mongoose from "mongoose";

const revokeTokenShcema = mongoose.Schema(
  {
    tokenID: {
      type: String,
      required: true,
      trim: true,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    expiredAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

revokeTokenShcema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

const revokeTokenModel =
  mongoose.models.revokeToken ||
  mongoose.model("revokeToken", revokeTokenShcema);
export default revokeTokenModel;
