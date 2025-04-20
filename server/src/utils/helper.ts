export const generateToken = (len = 8) => {
  let token = "";

  for (let i = 0; i < len; i++) {
    const digit = Math.floor(Math.random() * 10);
    token += digit;
  }

  return token;
}
