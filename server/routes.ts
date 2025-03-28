import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  adminLoginSchema, 
  insertUserSchema,
  verifyOtpSchema, 
  insertBookingSchema,
  updateUserStatusSchema,
  updateBookingStatusSchema,
  allocateDriverSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { 
  authenticateAdmin, 
  authenticateUser, 
  adminLogin, 
  userLogin,
  logout
} from "./auth";
import { saveOTP, sendOTP, verifyOTP } from "./otp";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Helper for handling validation errors
  const validateRequest = (schema: any, data: any) => {
    try {
      return { data: schema.parse(data), error: null };
    } catch (error) {
      if (error instanceof ZodError) {
        return { data: null, error: error.format() };
      }
      return { data: null, error };
    }
  };

  // ======== ADMIN ROUTES ========

  // Admin login
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    console.log("======= ADMIN LOGIN DEBUG =======");
    console.log("Admin login attempt received");
    console.log("Headers:", JSON.stringify(req.headers));
    console.log("Body:", JSON.stringify(req.body));
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("================================");
    
    const { data, error } = validateRequest(adminLoginSchema, req.body);
    if (error) {
      console.log("Login validation error:", JSON.stringify(error));
      return res.status(400).json({ message: "Invalid input", error });
    }

    console.log(`Attempting admin login for username: ${data.username}`);
    const token = await adminLogin(data.username, data.password);
    
    if (!token) {
      console.log("Admin login failed - invalid credentials");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Admin login successful - token generated");
    return res.status(200).json({ token });
  });

  // Get pending users
  app.get("/api/admin/users/pending", authenticateAdmin, async (req: Request, res: Response) => {
    const pendingUsers = await storage.getPendingUsers();
    console.log(pendingUsers);
    return res.status(200).json(pendingUsers);
  });
  

  // Approve or reject user
  app.put("/api/admin/users/status", authenticateAdmin, async (req: Request, res: Response) => {
    const { data, error } = validateRequest(updateUserStatusSchema, req.body);
    if (error) return res.status(400).json({ message: "Invalid input", error });
    
    const user = await storage.getUser(data.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await storage.updateUserStatus(data.id, data.status);
    return res.status(200).json(updatedUser);
  });

  // Get all booking requests
  app.get("/api/admin/bookings/pending", authenticateAdmin, async (req: Request, res: Response) => {
    const pendingBookings = await storage.getPendingBookings();
    
    // Get user details for each booking
    const bookingsWithUsers = await Promise.all(
      pendingBookings.map(async (booking) => {
        const user = await storage.getUser(booking.userId);
        return {
          ...booking,
          user
        };
      })
    );
    
    return res.status(200).json(bookingsWithUsers);
  });

  // Approve or reject booking
  app.patch("/api/admin/bookings/status", authenticateAdmin, async (req: Request, res: Response) => {
    const { data, error } = validateRequest(updateBookingStatusSchema, req.body);
    if (error) return res.status(400).json({ message: "Invalid input", error });

    const booking = await storage.getBooking(data.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const updatedBooking = await storage.updateBookingStatus(data.id, data.status);
    return res.status(200).json(updatedBooking);
  });

  // Get approved bookings for allocation
  app.get("/api/admin/bookings/approved", authenticateAdmin, async (req: Request, res: Response) => {
    const approvedBookings = await storage.getApprovedBookings();
    
    // Get user details and check allocation status for each booking
    const bookingsWithDetails = await Promise.all(
      approvedBookings.map(async (booking) => {
        const user = await storage.getUser(booking.userId);
        const allocation = await storage.getBookingAllocation(booking.id);
        let driver = null;
        
        if (allocation) {
          driver = await storage.getDriver(allocation.driverId);
        }
        
        return {
          ...booking,
          user,
          allocation: allocation ? {
            ...allocation,
            driver
          } : null
        };
      })
    );
    
    return res.status(200).json(bookingsWithDetails);
  });

  // Get all drivers for allocation
  app.get("/api/admin/drivers", authenticateAdmin, async (req: Request, res: Response) => {
    const drivers = await storage.getAllDrivers();
    return res.status(200).json(drivers);
  });

  // Allocate driver to booking
  app.post("/api/admin/allocate", authenticateAdmin, async (req: Request, res: Response) => {
    const { data, error } = validateRequest(allocateDriverSchema, req.body);
    if (error) return res.status(400).json({ message: "Invalid input", error });

    const booking = await storage.getBooking(data.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const driver = await storage.getDriver(data.driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Check if booking is already allocated
    const existingAllocation = await storage.getBookingAllocation(data.bookingId);
    if (existingAllocation) {
      return res.status(400).json({ message: "Booking already allocated to a driver" });
    }

    const allocation = await storage.allocateDriver({
      bookingId: data.bookingId,
      driverId: data.driverId
    });

    return res.status(201).json(allocation);
  });

  // ======== USER ROUTES ========

  // User registration
  app.post("/api/user/register", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertUserSchema, req.body);
    if (error) return res.status(400).json({ message: "Invalid input", error });

    // Check if user already exists
    const existingEmail = await storage.getUserByEmail(data.email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingPhone = await storage.getUserByPhone(data.phoneNumber);
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    // Create user
    const user = await storage.createUser(data);

    // Generate and send OTP
    const otp = await saveOTP(user.phoneNumber, user.id);
    const sent = await sendOTP(user.phoneNumber, otp);

    if (!sent) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    return res.status(201).json({ 
      message: "User registered successfully! OTP sent for verification", 
      userId: user.id 
    });
  });

  // Verify OTP for registration
  app.post("/api/user/verify-otp", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(verifyOtpSchema, req.body);
    if (error) return res.status(400).json({ message: "Invalid input", error });

    const isValid = await verifyOTP(data.phoneNumber, data.otp);
    
    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Get user by phone number
    const user = await storage.getUserByPhone(data.phoneNumber);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "OTP verification successful" });
  });

  // User login (request OTP)
  app.post("/api/user/login", async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Check if user exists and is approved
    const user = await storage.getUserByPhone(phoneNumber);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status !== "approved") {
      return res.status(403).json({ 
        message: "Your account is not approved yet. Please wait for admin approval." 
      });
    }

    // Generate and send OTP
    const otp = await saveOTP(phoneNumber, user.id);
    const sent = await sendOTP(phoneNumber, otp);

    if (!sent) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    return res.status(200).json({ message: "OTP sent for verification" });
  });

  // Verify OTP for login
  app.post("/api/user/login/verify", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(verifyOtpSchema, req.body);
    if (error) return res.status(400).json({ message: "Invalid input", error });

    const isValid = await verifyOTP(data.phoneNumber, data.otp);
    
    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Get user by phone number
    const user = await storage.getUserByPhone(data.phoneNumber);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status !== "approved") {
      return res.status(403).json({ 
        message: "Your account is not approved yet. Please wait for admin approval." 
      });
    }

    // Generate token
    const token = await userLogin(user.id);

    return res.status(200).json({ 
      message: "Login successful", 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });
  });

  // User logout
  app.post("/api/user/logout", authenticateUser, async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }
    
    const success = await logout(token);
    
    if (!success) {
      return res.status(400).json({ message: "Invalid token" });
    }
    
    return res.status(200).json({ message: "Logout successful" });
  });

  // Create booking
  app.post("/api/user/bookings", authenticateUser, async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertBookingSchema, req.body);
    if (error) return res.status(400).json({ message: "Invalid input", error });

    // Get user from auth token
    const userId = req.body.auth.userId;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status !== "approved") {
      return res.status(403).json({ 
        message: "Your account is not approved yet. Please wait for admin approval." 
      });
    }

    // Create booking
    const booking = await storage.createBooking({
      ...data,
    });

    return res.status(201).json(booking);
  });

  return httpServer;
}
