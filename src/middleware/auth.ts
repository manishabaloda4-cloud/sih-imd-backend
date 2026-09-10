import { Request, Response, NextFunction } from "express";
import { clerkMiddleware, requireAuth, getAuth } from "@clerk/express";
import User, { UserRole } from "../models/User";

// Attaches Clerk auth to every request - put this early in server.ts
export const attachClerk = clerkMiddleware();

// Use this on any route that needs a logged-in user
export const requireLogin = requireAuth();

// Use this AFTER requireLogin on routes that need a specific role
// Example: router.post("/courses", requireLogin, requireRole(["admin", "trainer"]), createCourse)
export const requireRole = (allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await User.findOne({ clerkId: userId });
      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: "Not authorized for this action" });
      }
      // attach the DB user to the request so route handlers can use it
      (req as any).dbUser = user;
      next();
    } catch (error) {
      res.status(500).json({ error: "Auth check failed" });
    }
  };
};

// Use AFTER requireRole(["trainer"]) on routes only an APPROVED trainer should hit
// (e.g. creating courses). A PENDING trainer is blocked until admin approves them.
export const requireApproved = async (req: Request, res: Response, next: NextFunction) => {
  const dbUser = (req as any).dbUser;
  if (!dbUser) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (dbUser.role === "trainer" && dbUser.status !== "APPROVED") {
    return res.status(403).json({ error: "Trainer account is pending admin approval" });
  }
  next();
};

// Use on routes where a trainer should only touch their OWN resource
// (e.g. editing a course). Compares the resource's ownerField against dbUser._id.
// Admins bypass this check automatically.
export const requireOwnership = (
  getOwnerId: (req: Request) => Promise<string | null>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dbUser = (req as any).dbUser;
    if (dbUser.role === "admin") return next(); // admins can touch anything
    const ownerId = await getOwnerId(req);
    if (!ownerId || ownerId !== dbUser._id.toString()) {
      return res.status(403).json({ error: "You do not own this resource" });
    }
    next();
  };
};
