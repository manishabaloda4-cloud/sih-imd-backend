import { Response } from "express";

export function success(res: Response, data: any, message = "OK", status = 200) {
  return res.status(status).json({ success: true, data, message });
}

export function fail(res: Response, message: string, status = 400, error?: any) {
  return res.status(status).json({ success: false, message, error: error?.message || error });
}
