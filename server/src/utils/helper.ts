import { UserDocument } from "#/models/user";

export const generateToken = (len = 8) => {
  let token = "";

  for (let i = 0; i < len; i++) {
    const digit = Math.floor(Math.random() * 10);
    token += digit;
  }

  return token;
}

export const formatProfile = (user: UserDocument) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    avatar: user.avatar?.url,
    followers: user.followers.length,
    followings: user.followings.length,
  };
}
