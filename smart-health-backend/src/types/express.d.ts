//types/express.d.ts
import { UserDocument  } from '../users/users.schema';

declare global {
  namespace Express {
    interface User extends UserDocument {}

    interface Request {
      user?: User; 
      session: Session & Partial<SessionData>;
    }
  }
}

declare module 'express-session' {
    interface SessionData {
        user?: {
            _id: string;
            name: string;
            email: string;
        };
        [key: string]: any;
    }
}

export {};