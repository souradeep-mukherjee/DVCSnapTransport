import { storage } from './storage';

// Generate a random OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Save OTP to storage
export async function saveOTP(phoneNumber: string, userId?: number): Promise<string> {
  // Generate OTP
  const otp = generateOTP();
  
  // Set expiry time (1:30 minutes from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 1.5);
  
  // Save to storage
  await storage.createOtp({
    userId,
    phoneNumber,
    otp,
    expiresAt,
  });
  
  return otp;
}

// Send OTP via Gupshup service (mock implementation)
export async function sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    // In a real implementation, this would call the Gupshup API
    console.log(`Sending OTP ${otp} to ${phoneNumber} via Gupshup`);
    
    // Gupshup API would be called here with API keys from environment variables
    // const gupshupApiKey = process.env.GUPSHUP_API_KEY;
    // const gupshupApiSecret = process.env.GUPSHUP_API_SECRET;
    
    // For now, we'll simulate a successful send
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
}

// Verify OTP
export async function verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
  return await storage.verifyOtp(phoneNumber, otp);
}
