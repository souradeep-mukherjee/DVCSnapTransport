import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
}

interface Driver {
  id: number;
  name: string;
  phoneNumber: string;
  licenseNumber: string;
  status: string;
}

interface Allocation {
  id: number;
  bookingId: number;
  driverId: number;
  status: string;
  driver?: Driver;
}

interface Booking {
  id: number;
  userId: number;
  purpose: string;
  pickupAddress: string;
  dropAddress: string;
  pickupDateTime: string;
  returnDateTime?: string;
  status: string;
  user?: User;
  allocation?: Allocation | null;
}

export default function DriverAllocation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrivers, setSelectedDrivers] = useState<Record<number, number>>({});
  const { toast } = useToast();

  // Fetch approved bookings
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ['/api/admin/bookings/approved'],
  });

  // Fetch all drivers
  const { data: drivers = [], isLoading: isLoadingDrivers } = useQuery<Driver[]>({
    queryKey: ['/api/admin/drivers'],
  });

  // Allocate driver to booking
  const { mutate: allocateDriver, isPending: isAllocating } = useMutation({
    mutationFn: async ({ bookingId, driverId }: { bookingId: number; driverId: number }) => {
      const res = await apiRequest('POST', '/api/admin/allocate', { bookingId, driverId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings/approved'] });
      toast({
        title: "Success",
        description: "Driver allocated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to allocate driver: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle allocate driver
  const handleAllocateDriver = (bookingId: number) => {
    const driverId = selectedDrivers[bookingId];
    if (!driverId) {
      toast({
        title: "Error",
        description: "Please select a driver first",
        variant: "destructive",
      });
      return;
    }
    
    allocateDriver({ bookingId, driverId });
  };

  // Handle change driver selection
  const handleDriverChange = (bookingId: number, driverId: string) => {
    setSelectedDrivers((prev) => ({
      ...prev,
      [bookingId]: parseInt(driverId),
    }));
  };

  // Handle change driver for already allocated booking
  const handleChangeDriver = (bookingId: number) => {
    toast({
      title: "Feature in progress",
      description: "Driver reassignment feature is coming soon",
    });
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.dropAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.pickupDateTime.includes(searchQuery) ||
      booking.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user?.phoneNumber.includes(searchQuery) ||
      booking.allocation?.driver?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.allocation?.driver?.phoneNumber.includes(searchQuery);

    return matchesSearch;
  });

  const isLoading = isLoadingBookings || isLoadingDrivers;

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-medium text-neutral-500 mb-4 md:mb-0">Driver Allocation</h2>
        <div className="relative w-full md:w-64">
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
          <Search className="h-5 w-5 absolute left-3 top-2.5 text-neutral-300" />
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden mb-6">
        {isLoading ? (
          <div className="p-8 text-center">Loading approved bookings...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="font-medium text-left px-6 py-4">ID</th>
                  <th className="font-medium text-left px-6 py-4">User Details</th>
                  <th className="font-medium text-left px-6 py-4">Ride Details</th>
                  <th className="font-medium text-left px-6 py-4">Date & Time</th>
                  <th className="font-medium text-left px-6 py-4">Current Status</th>
                  <th className="font-medium text-left px-6 py-4">Driver Allocation</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-neutral-500">
                      No approved bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-neutral-200">
                      <td className="px-6 py-4">BK{booking.id.toString().padStart(3, '0')}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{booking.user?.name}</span>
                          <span className="text-sm text-neutral-400">{booking.user?.phoneNumber}</span>
                          <span className="text-sm text-neutral-400">{booking.user?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{booking.purpose}</span>
                          <span className="text-sm">From: {booking.pickupAddress}</span>
                          <span className="text-sm">To: {booking.dropAddress}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{booking.pickupDateTime}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${booking.allocation ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          {booking.allocation ? 'Allocated' : 'Not Allocated'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {booking.allocation ? (
                          <div className="flex items-center">
                            <div className="flex flex-col mr-2">
                              <span className="font-medium text-sm">
                                {booking.allocation.driver?.name} (D{booking.allocation.driverId.toString().padStart(3, '0')})
                              </span>
                              <span className="text-xs text-neutral-400">
                                {booking.allocation.driver?.phoneNumber}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-2 py-1 ml-auto text-sm"
                              onClick={() => handleChangeDriver(booking.id)}
                            >
                              Change
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Select
                              value={selectedDrivers[booking.id]?.toString() || ""}
                              onValueChange={(value) => handleDriverChange(booking.id, value)}
                            >
                              <SelectTrigger className="w-[200px] h-9 mr-2">
                                <SelectValue placeholder="Select Driver" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Select Driver</SelectItem>
                                {drivers.map((driver) => (
                                  <SelectItem key={driver.id} value={driver.id.toString()}>
                                    {driver.name} (D{driver.id.toString().padStart(3, '0')})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              className="px-3 py-1 bg-primary hover:bg-primary/90"
                              onClick={() => handleAllocateDriver(booking.id)}
                              disabled={isAllocating || !selectedDrivers[booking.id]}
                            >
                              Allocate
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-neutral-400">
          Showing {filteredBookings.length} of {bookings.length} approved bookings
        </div>
      </div>
    </div>
  );
}
