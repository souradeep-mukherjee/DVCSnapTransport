import { MongoClient, Collection, ObjectId } from 'mongodb';
import { 
  User, InsertUser, 
  Otp, InsertOtp, 
  Booking, InsertBooking, 
  Driver, InsertDriver, 
  Allocation, InsertAllocation, 
  Session, InsertSession
} from '@shared/schema';
import { IStorage } from './storage';

// MongoDB connection string from environment variable
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://souradeep:SnapE1234@admin.pebm2.mongodb.net/';
const DB_NAME = 'snapedb';

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: any;
  private users!: Collection;
  private otps!: Collection;
  private bookings!: Collection;
  private drivers!: Collection;
  private allocations!: Collection;
  private sessions!: Collection;
  private connected: boolean = false;

  constructor() {
    this.client = new MongoClient(MONGO_URI);
    this.init();
  }

  private async init() {
    try {
      console.log('Connecting to MongoDB...');
      await this.client.connect();
      console.log('Connected to MongoDB');
      
      this.db = this.client.db(DB_NAME);
      this.users = this.db.collection('users');
      this.otps = this.db.collection('otps');
      this.bookings = this.db.collection('bookings');
      this.drivers = this.db.collection('drivers');
      this.allocations = this.db.collection('allocations');
      this.sessions = this.db.collection('sessions');
      
      this.connected = true;
      
      // Create indexes for unique fields
      await this.users.createIndex({ email: 1 }, { unique: true });
      await this.users.createIndex({ phoneNumber: 1 }, { unique: true });
      await this.otps.createIndex({ phoneNumber: 1 });
      await this.sessions.createIndex({ token: 1 }, { unique: true });
      
      console.log('MongoDB indexes created');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      // Fallback to in-memory storage if MongoDB connection fails
      this.connected = false;
    }
  }

  // Helper to convert MongoDB _id to id and ensure proper typing
  private _formatDocument(doc: any): any {
    if (!doc) return doc;
    const { _id, ...rest } = doc;
    return { id: new ObjectId(_id), ...rest };
  }

  // Ensure userId and other nullable fields are properly formatted
  private _formatInsertData(data: any): any {
    const formatted = { ...data };
    
    // Handle userId field - convert undefined to null
    if (formatted.userId === undefined) {
      formatted.userId = null;
    }
    
    // Handle returnDateTime field for bookings
    if (formatted.returnDateTime === undefined) {
      formatted.returnDateTime = null;
    }
    
    return formatted;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    if (!this.connected) throw new Error('MongoDB not connected');
    const user = await this.users.findOne({ _id: new ObjectId(id) });
    return user ? this._formatDocument(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!this.connected) throw new Error('MongoDB not connected');
    const user = await this.users.findOne({ email });
    return user ? this._formatDocument(user) : undefined;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    if (!this.connected) throw new Error('MongoDB not connected');
    const user = await this.users.findOne({ phoneNumber });
    return user ? this._formatDocument(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    // Get next ID
    const counter = await this.db.collection('counters').findOneAndUpdate(
      { _id: 'userId' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    
    
    const userDoc = {
      ...this._formatInsertData(insertUser),
      status: 'pending',
      createdAt: new Date()
    };
    
    await this.users.insertOne(userDoc);
    return this._formatDocument(userDoc);
  }

  async updateUserStatus(userid: string, status: string): Promise<User | undefined> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const result = await this.users.findOneAndUpdate(
      { _id: new ObjectId(userid) },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    
    return result && result.value ? this._formatDocument(result.value) : undefined;
  }

  async getPendingUsers(): Promise<User[]> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const users = await this.users.find({ status: 'pending' }).toArray();
    console.log(users);
    return users.map(this._formatDocument);
  }

  async getApprovedUsers(): Promise<User[]> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const users = await this.users.find({ status: 'approved' }).toArray();
    return users.map(this._formatDocument);
  }

  // OTP operations
  async createOtp(insertOtp: InsertOtp): Promise<Otp> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    // Get next ID
    const counter = await this.db.collection('counters').findOneAndUpdate(
      { _id: 'otpId' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
  
    
    // Remove any existing OTPs for this phone number
    await this.otps.deleteMany({ phoneNumber: insertOtp.phoneNumber });
    
    const otpDoc = {
      ...this._formatInsertData(insertOtp),
      createdAt: new Date(),
      isVerified: false
    };
    
    await this.otps.insertOne(otpDoc);
    return this._formatDocument(otpDoc);
  }

  async getOtpByPhone(phoneNumber: string): Promise<Otp | undefined> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const otp = await this.otps.findOne({ 
      phoneNumber,
      expiresAt: { $gt: new Date() }
    });
    
    return otp ? this._formatDocument(otp) : undefined;
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const otpRecord = await this.otps.findOne({
      phoneNumber,
      otp,
      expiresAt: { $gt: new Date() },
      isVerified: false
    });
    
    if (!otpRecord) return false;
    
    await this.otps.updateOne(
      { _id: otpRecord._id },
      { $set: { isVerified: true } }
    );
    
    return true;
  }

  // Booking operations
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    // Get next ID
    const counter = await this.db.collection('counters').findOneAndUpdate(
      { _id: 'bookingId' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    
    
    const bookingDoc = {
      ...this._formatInsertData(insertBooking),
      status: 'pending',
      createdAt: new Date()
    };
    
    await this.bookings.insertOne(bookingDoc);
    return this._formatDocument(bookingDoc);
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const booking = await this.bookings.findOne({ _id: new ObjectId(id) });
    if (!booking) return undefined;
    
    // Get user details if needed
    const bookingWithUser = this._formatDocument(booking);
    const user = await this.users.findOne({ _id: new ObjectId(booking.userId) });
    
    if (user) {
      bookingWithUser.user = this._formatDocument(user);
    }
    
    return bookingWithUser;
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const bookings = await this.bookings.find({ userId: Number(userId) }).toArray();
    return bookings.map(this._formatDocument);
  }

  async getPendingBookings(): Promise<Booking[]> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const bookings = await this.bookings.find({ status: 'pending' }).toArray();
    const formattedBookings = bookings.map(this._formatDocument);
    
    // Get user details for each booking
    for (const booking of formattedBookings) {
      const user = await this.users.findOne({ _id: new ObjectId(booking.userId) });
      if (user) {
        booking.user = this._formatDocument(user);
      }
    }
    
    return formattedBookings;
  }

  async getApprovedBookings(): Promise<Booking[]> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const bookings = await this.bookings.find({ status: 'approved' }).toArray();
    const formattedBookings = bookings.map(this._formatDocument);
    
    // Get user details for each booking
    for (const booking of formattedBookings) {
      const user = await this.users.findOne({ _id: new ObjectId(booking.userId) });
      if (user) {
        booking.user = this._formatDocument(user);
      }
      
      // Get allocation if exists
      const allocation = await this.allocations.findOne({ bookingId: Number(booking.id) });
      if (allocation) {
        const formattedAllocation = this._formatDocument(allocation);
        
        // Get driver details
        const driver = await this.drivers.findOne({ _id: new ObjectId(allocation.driverId) });
        if (driver) {
          formattedAllocation.driver = this._formatDocument(driver);
        }
        
        booking.allocation = formattedAllocation;
      } else {
        booking.allocation = null;
      }
    }
    
    return formattedBookings;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const result = await this.bookings.findOneAndUpdate(
      { _id: new Object(id) },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    
    return result.value ? this._formatDocument(result.value) : undefined;
  }

  // Driver operations
  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    // Get next ID
    const counter = await this.db.collection('counters').findOneAndUpdate(
      { _id: 'driverId' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    
    
    const driverDoc = {
      ...this._formatInsertData(insertDriver),
      status: 'available',
      createdAt: new Date()
    };
    
    await this.drivers.insertOne(driverDoc);
    return this._formatDocument(driverDoc);
  }

  async getDriver(id: number): Promise<Driver | undefined> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const driver = await this.drivers.findOne({ _id: Number(id) });
    return driver ? this._formatDocument(driver) : undefined;
  }

  async getAllDrivers(): Promise<Driver[]> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const drivers = await this.drivers.find().toArray();
    return drivers.map(this._formatDocument);
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const drivers = await this.drivers.find({ status: 'available' }).toArray();
    return drivers.map(this._formatDocument);
  }

  // Allocation operations
  async allocateDriver(insertAllocation: InsertAllocation): Promise<Allocation> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    // Get next ID
    const counter = await this.db.collection('counters').findOneAndUpdate(
      { _id: 'allocationId' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    
    
    const allocationDoc = {
      ...this._formatInsertData(insertAllocation),
      status: 'assigned',
      createdAt: new Date()
    };
    
    await this.allocations.insertOne(allocationDoc);
    
    // Update driver status
    await this.drivers.updateOne(
      { _id: Number(insertAllocation.driverId) },
      { $set: { status: 'assigned' } }
    );
    
    return this._formatDocument(allocationDoc);
  }

  async getAllocatedBookings(): Promise<Allocation[]> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const allocations = await this.allocations.find().toArray();
    const formattedAllocations = allocations.map(this._formatDocument);
    
    // Get driver details for each allocation
    for (const allocation of formattedAllocations) {
      const driver = await this.drivers.findOne({ _id: Number(allocation.driverId) });
      if (driver) {
        allocation.driver = this._formatDocument(driver);
      }
    }
    
    return formattedAllocations;
  }

  async getBookingAllocation(bookingId: number): Promise<Allocation | undefined> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const allocation = await this.allocations.findOne({ bookingId: Number(bookingId) });
    if (!allocation) return undefined;
    
    const formattedAllocation = this._formatDocument(allocation);
    
    // Get driver details
    const driver = await this.drivers.findOne({ _id: Number(allocation.driverId) });
    if (driver) {
      formattedAllocation.driver = this._formatDocument(driver);
    }
    
    return formattedAllocation;
  }

  // Session operations
  async createSession(insertSession: InsertSession): Promise<Session> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    // Get next ID
    const counter = await this.db.collection('counters').findOneAndUpdate(
      { _id: 'sessionId' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    
    
    const sessionDoc = {
      ...this._formatInsertData(insertSession),
      createdAt: new Date()
    };
    
    await this.sessions.insertOne(sessionDoc);
    return this._formatDocument(sessionDoc);
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const session = await this.sessions.findOne({ 
      token,
      expiresAt: { $gt: new Date() }
    });
    
    return session ? this._formatDocument(session) : undefined;
  }

  async deleteSession(token: string): Promise<boolean> {
    if (!this.connected) throw new Error('MongoDB not connected');
    
    const result = await this.sessions.deleteOne({ token });
    return result.deletedCount > 0;
  }
}

// Create and export a singleton instance
export const mongoStorage = new MongoStorage();