import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "ip-management-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      secure: false, // Set to false for development, process.env.NODE_ENV === "production" for production
      sameSite: "lax",
      path: "/"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Init admin user if none exists
  const initAdminUser = async () => {
    try {
      // Check if admin user exists
      const adminUsers = Array.from(await storage.getAllUsers())
        .filter(user => user.role === 'admin' || user.role === 'superadmin');
      
      if (adminUsers.length === 0) {
        console.log('Creating default admin user...');
        // Create default admin with simplified schema
        await storage.createUser({
          username: 'admin',
          password: await hashPassword('admin123'), // This is just a default password
          name: 'System Administrator',
          email: 'admin@ipchain.example',
          role: 'superadmin'
        });
        console.log('Default admin user created. Username: admin, Password: admin123');
      }
    } catch (error) {
      console.error('Error initializing admin user:', error);
    }
  };
  
  // Call init function
  initAdminUser();

  app.post("/api/register", async (req, res, next) => {
    try {
      const { 
        username, 
        password, 
        name, 
        email, 
        role = "user"
      } = req.body;
      
      if (!username || !password || !name || !email) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(req.body.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Only admins can create admin users
      if ((role === 'admin' || role === 'superadmin') && 
          (!req.isAuthenticated() || 
           (req.user.role !== 'admin' && req.user.role !== 'superadmin'))) {
        return res.status(403).json({ 
          message: "Only administrators can create admin accounts" 
        });
      }
      
      // Only superadmin can create admin/superadmin
      if ((role === 'admin' || role === 'superadmin') && 
          req.user?.role !== 'superadmin') {
        return res.status(403).json({ 
          message: "Only superadmins can create admin accounts" 
        });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        name,
        email,
        role
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Authentication failed" });
      }
      
      // Log in the user
      req.login(user, async (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        try {
          // Don't send password back to client
          const { password, ...userWithoutPassword } = user;
          
          // Log admin logins
          if (user.role === 'admin' || user.role === 'superadmin') {
            console.log(`Admin user logged in: ${user.username} (${user.role})`);
          }
          
          res.status(200).json(userWithoutPassword);
        } catch (error) {
          console.error("Error during login:", error);
          // Still return user but without updating last login
          const { password, ...userWithoutPassword } = user;
          res.status(200).json(userWithoutPassword);
        }
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Don't send password back to client
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  
  // Middleware for checking admin role
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  };
  
  // Middleware for checking superadmin role
  const requireSuperAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: "Superadmin access required" });
    }
    
    next();
  };
  
  // Admin routes
  // List all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      next(error);
    }
  });
  
  // Get user details (admin only)
  app.get("/api/admin/users/:id", requireAdmin, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
  
  // Update user role (superadmin only)
  app.patch("/api/admin/users/:id/role", 
    requireSuperAdmin,
    async (req, res, next) => {
      try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
        
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Make sure we have a valid role
        const role = req.body.role;
        if (!role || !['user', 'admin', 'superadmin'].includes(role)) {
          return res.status(400).json({ 
            message: "Invalid role. Must be 'user', 'admin', or 'superadmin'" 
          });
        }
        
        // Update user role
        const updatedUser = await storage.updateUser(userId, { role });
        
        if (!updatedUser) {
          return res.status(500).json({ message: "Failed to update user" });
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = updatedUser;
        
        // Log the role change
        console.log(`User role updated for ${user.username} to ${role} by ${req.user?.username || 'unknown'}`);
        
        res.json(userWithoutPassword);
      } catch (error) {
        next(error);
      }
    }
  );
}
