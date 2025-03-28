import { 
  users, type User, type InsertUser,
  otps, type Otp, type InsertOtp,
  bookings, type Booking, type InsertBooking,
  drivers, type Driver, type InsertDriver,
  allocations, type Allocation, type InsertAllocation,
  sessions, type Session, type InsertSession
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;
  getPendingUsers(): Promise<User[]>;
  getApprovedUsers(): Promise<User[]>;
  
  // OTP operations
  createOtp(otp: InsertOtp): Promise<Otp>;
  getOtpByPhone(phoneNumber: string): Promise<Otp | undefined>;
  verifyOtp(phoneNumber: string, otp: string): Promise<boolean>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getPendingBookings(): Promise<Booking[]>;
  getApprovedBookings(): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Driver operations
  createDriver(driver: InsertDriver): Promise<Driver>;
  getDriver(id: number): Promise<Driver | undefined>;
  getAllDrivers(): Promise<Driver[]>;
  getAvailableDrivers(): Promise<Driver[]>;
  
  // Allocation operations
  allocateDriver(allocation: InsertAllocation): Promise<Allocation>;
  getAllocatedBookings(): Promise<Allocation[]>;
  getBookingAllocation(bookingId: number): Promise<Allocation | undefined>;
  
  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private otps: Map<number, Otp>;
  private bookings: Map<number, Booking>;
  private drivers: Map<number, Driver>;
  private allocations: Map<number, Allocation>;
  private sessions: Map<number, Session>;
  currentUserId: number;
  currentOtpId: number;
  currentBookingId: number;
  currentDriverId: number;
  currentAllocationId: number;
  currentSessionId: number;

  constructor() {
    this.users = new Map();
    this.otps = new Map();
    this.bookings = new Map();
    this.drivers = new Map();
    this.allocations = new Map();
    this.sessions = new Map();
    
    this.currentUserId = 1;
    this.currentOtpId = 1;
    this.currentBookingId = 1;
    this.currentDriverId = 1;
    this.currentAllocationId = 1;
    this.currentSessionId = 1;
    
    // Initialize with some sample drivers
    this.createDriver({
      name: "Rajesh Kumar",
      phoneNumber: "+91 8765432100",
      licenseNumber: "DL-1234567890",
    });
    
    this.createDriver({
      name: "Amit Singh",
      phoneNumber: "+91 8765432101",
      licenseNumber: "DL-2345678901",
    });
    
    this.createDriver({
      name: "Vijay Sharma",
      phoneNumber: "+91 8765432102",
      licenseNumber: "DL-3456789012",
    });
    
    this.createDriver({
      name: "Rakesh Patel",
      phoneNumber: "+91 8765432103",
      licenseNumber: "DL-4567890123",
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phoneNumber === phoneNumber,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      status: "pending", 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, status };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getPendingUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.status === "pending",
    );
  }

  async getApprovedUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.status === "approved",
    );
  }

  // OTP operations
  async createOtp(insertOtp: InsertOtp): Promise<Otp> {
    const id = this.currentOtpId++;
    const otp: Otp = { 
      ...insertOtp, 
      id, 
      isVerified: false, 
      createdAt: new Date() 
    };
    this.otps.set(id, otp);
    return otp;
  }

  async getOtpByPhone(phoneNumber: string): Promise<Otp | undefined> {
    // Get the most recent OTP for this phone number
    const otpsForPhone = Array.from(this.otps.values())
      .filter(otp => otp.phoneNumber === phoneNumber)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return otpsForPhone.length > 0 ? otpsForPhone[0] : undefined;
  }

  async verifyOtp(phoneNumber: string, otpValue: string): Promise<boolean> {
    const otp = await this.getOtpByPhone(phoneNumber);
    
    if (!otp) return false;
    if (otp.expiresAt < new Date()) return false;
    if (otp.isVerified) return false;
    if (otp.otp !== otpValue) return false;
    
    // Mark OTP as verified
    const updatedOtp = { ...otp, isVerified: true };
    this.otps.set(otp.id, updatedOtp);
    
    return true;
  }

  // Booking operations
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      status: "pending", 
      createdAt: new Date() 
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId,
    );
  }

  async getPendingBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.status === "pending",
    );
  }

  async getApprovedBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.status === "approved",
    );
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Driver operations
  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const id = this.currentDriverId++;
    const driver: Driver = { 
      ...insertDriver, 
      id, 
      status: "available", 
      createdAt: new Date() 
    };
    this.drivers.set(id, driver);
    return driver;
  }

  async getDriver(id: number): Promise<Driver | undefined> {
    return this.drivers.get(id);
  }

  async getAllDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values());
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values()).filter(
      (driver) => driver.status === "available",
    );
  }

  // Allocation operations
  async allocateDriver(insertAllocation: InsertAllocation): Promise<Allocation> {
    const id = this.currentAllocationId++;
    const allocation: Allocation = { 
      ...insertAllocation, 
      id, 
      status: "allocated", 
      createdAt: new Date() 
    };
    this.allocations.set(id, allocation);
    
    // Update driver status
    const driver = this.drivers.get(insertAllocation.driverId);
    if (driver) {
      const updatedDriver = { ...driver, status: "busy" };
      this.drivers.set(driver.id, updatedDriver);
    }
    
    return allocation;
  }

  async getAllocatedBookings(): Promise<Allocation[]> {
    return Array.from(this.allocations.values());
  }

  async getBookingAllocation(bookingId: number): Promise<Allocation | undefined> {
    return Array.from(this.allocations.values()).find(
      (allocation) => allocation.bookingId === bookingId,
    );
  }

  // Session operations
  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentSessionId++;
    const session: Session = { 
      ...insertSession, 
      id, 
      createdAt: new Date() 
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(
      (session) => session.token === token,
    );
  }

  async deleteSession(token: string): Promise<boolean> {
    const session = await this.getSessionByToken(token);
    if (!session) return false;
    
    this.sessions.delete(session.id);
    return true;
  }
}

// Import MongoDB storage
import { mongoStorage } from './mongoStorage';

// Use MongoDB storage as primary storage
export const storage = mongoStorage;
