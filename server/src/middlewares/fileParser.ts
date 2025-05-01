import { RequestHandler, Request } from "express";
import formidable from "formidable";
import { File } from "formidable";


export interface RequestWithFiles extends Request {
  files?: {[key: string]: File}
}

export const fileParser: RequestHandler = async (req: RequestWithFiles, res, next) => {
  if (!req.headers["content-type"]?.startsWith("multipart/form-data;")) {
    return res.status(422).json({ error: "Only Accepts Form Data!" });
  }

  const form = formidable();

  const [fields, files] = await form.parse(req);

  for (let key in fields) {
    const field = fields[key];

    if (field) {
      req.body[key] = field[0];
    }
  }

  for (let key in files) {
    const file = files[key];

    if (!req.files) {
      req.files = {};
    }

    if (file) {
      req.files[key] = file[0];
    }
  }

  next();
};
