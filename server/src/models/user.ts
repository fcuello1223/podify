import { model, models, ObjectId, Schema, Types } from "mongoose";
import bcrypt, { compare } from "bcrypt";

export interface UserDocument {
  _id: Types.ObjectId,
  name: string;
  email: string;
  password: string;
  verified: boolean;
  avatar?: {
    url: string;
    publicId: string;
  };
  tokens: string[];
  favorites: ObjectId[];
  followers: ObjectId[];
  followings: ObjectId[];
}

interface Methods {
  comparePassword(password: string): Promise<boolean>
}

const userSchema = new Schema<UserDocument, {}, Methods>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      url: String,
      publicId: String,
    },
    tokens: [String],
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Audio",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followings: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

//Hash Password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

// userSchema.methods.comparePassword = async function (password: string) {
//   const result = await compare(password, this.password);
//   return result;
// };
userSchema.methods.comparePassword = async function (
  this: UserDocument,
  password: string
): Promise<boolean> {
  return await compare(password, this.password);
};


// const User =
//   (models.User as Model<UserDocument, {}, Methods>) ||
//   model<UserDocument>("User", userSchema);

// export default User;

// const User =
//   (models.User as ReturnType<typeof model<UserDocument, {}, Methods>>) ??
//   model<UserDocument, {}, Methods>("User", userSchema);

// export default User;

const User =
  (models.User as ReturnType<typeof model<UserDocument, {}, Methods>>) ??
  model<UserDocument, {}, Methods>("User", userSchema as any); // temporary workaround

export default User;


