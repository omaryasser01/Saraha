import mongoose from "mongoose";
import { genderEnum, providerEnum } from "../../common/enum/user.enum.js";

const userShcema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLenght: 3,
      maxLenght: 5,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minLenght: 3,
      maxLenght: 5,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLenght: 5,
      trim: true,
    },
    age: Number,

    gender: {
      type: String,
      enum: Object.values(genderEnum),
      default: genderEnum.male,
    },

    profilePicture: String,

    confirmed: Boolean,

    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.Systme,
    },
  },
  {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userShcema
  .virtual("userName")
  .get(function () {
    return this.firstName + " " + this.lastName;
  })
  .set(function (v) {
    const [firstName, lastName] = v.split(" ");
    this.set({ firstName });
    this.set({ lastName });
  });
const userModel = mongoose.models.user || mongoose.model("user", userShcema);
export default userModel;
