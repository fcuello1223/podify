import { Schema, model, models, Model, ObjectId } from "mongoose";
import { hash, compare } from "bcrypt";

interface EmailVerificationTokenDocument {
  owner: ObjectId;
  token: string;
  createdAt: Date;
}

interface Methods {
  compareToken(token: string): Promise<boolean>;
}

const emailVerificationTokenSchema = new Schema<
  EmailVerificationTokenDocument,
  {},
  Methods
>({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
  },
});

emailVerificationTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    this.token = await hash(this.token, 10);
  }

  next();
});

emailVerificationTokenSchema.methods.compareToken = async function (token) {
  const result = await compare(token, this.token);
  return result;
};

const EmailVerificationToken =
  (models.EmailVerificationToken as Model<
    EmailVerificationTokenDocument,
    {},
    Methods
  >) ||
  model<EmailVerificationTokenDocument>(
    "EmailVerificationToken",
    emailVerificationTokenSchema
  );

export default EmailVerificationToken;
