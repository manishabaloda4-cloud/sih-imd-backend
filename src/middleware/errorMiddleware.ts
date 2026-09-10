import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: "Validation failed", error: err.message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format", error: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "Duplicate record", error: err.message });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
}

// wraps async route handlers so thrown errors reach errorMiddleware
// without needing try/catch in every single route
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
