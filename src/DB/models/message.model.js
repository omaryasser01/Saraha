import mongoose from "mongoose";

const msgShcema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minLenght: 1,
      maxLenght: 2000,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    attachments: [String],
  },
  {
    timestamps: true,
    strictQuery: true,
  },
);
const msgModel = mongoose.models.msg || mongoose.model("msg", msgShcema);
export default msgModel;
