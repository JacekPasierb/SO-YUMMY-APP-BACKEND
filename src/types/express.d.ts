// src/types/express.d.ts
import { IUser } from "../models/user"; // Importuj interfejs IUser

declare global {
  namespace Express {
    interface User extends IUser {} // Rozszerz IUser

    interface Request {
      user?: User;
    }
  }
}