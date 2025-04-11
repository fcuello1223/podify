import { RequestHandler } from "express";
import nodemailer from 'nodemailer';

import { CreateUser } from "#/types/user";
import User from "#/models/user";
import { MAILTRAP_PASSWORD, MAILTRAP_USER } from "#/utils/variables";

export const create: RequestHandler = async (req: CreateUser, res) => {
  const { name, email, password } = req.body;

  const newUser = await User.create({ name, email, password });

  //Send Verification E-Mail
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASSWORD,
    },
  });

  transport.sendMail({
    to: newUser.email,
    from: 'cucanana@cucanana.com',
    html: '<h1>1234567</h1>'
  })

  res.status(201).json({ user: newUser });
};
