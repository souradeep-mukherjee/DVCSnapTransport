import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { ObjectId } from "mongodb";
import { string, z } from "zod";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number").notNull().unique(),
  employeeNumber: text("employee_number").notNull(),
  department: text("department").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// OTP table schema
export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  phoneNumber: text("phone_number").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Booking table schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: string("userId"),
  purpose: text("purpose").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  dropAddress: text("drop_address").notNull(),
  pickupDateTime: text("pickup_date_time").notNull(),
  returnDateTime: text("return_date_time"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// Driver table schema
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  licenseNumber: text("license_number").notNull().unique(),
  status: text("status").notNull().default("available"), // available, busy, unavailable
  createdAt: timestamp("created_at").defaultNow(),
});

// Allocation table schema
export const allocations = pgTable("allocations", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  driverId: integer("driver_id").references(() => drivers.id).notNull(),
  status: text("status").notNull().default("allocated"), // allocated, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// Sessions table schema
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertOtpSchema = createInsertSchema(otps).omit({
  id: true,
  isVerified: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertAllocationSchema = createInsertSchema(allocations).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

// Validation schemas
export const verifyOtpSchema = z.object({
  phoneNumber: z.string(),
  otp: z.string(),
});

export const adminLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const updateUserStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["approved", "rejected"]),
});

export const updateBookingStatusSchema = z.object({
  id: z.number(),
  status: z.enum(["approved", "rejected"]),
});

export const allocateDriverSchema = z.object({
  bookingId: z.number(),
  driverId: z.number(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Otp = typeof otps.$inferSelect;
export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Allocation = typeof allocations.$inferSelect;
export type InsertAllocation = z.infer<typeof insertAllocationSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
