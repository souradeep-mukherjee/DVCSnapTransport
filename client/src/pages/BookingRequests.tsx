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
}

export default function BookingRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // Fetch booking requests
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/admin/bookings/pending'],
  });

  // Update booking status
  const { mutate: updateBookingStatus, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PATCH', '/api/admin/bookings/status', { id, status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings/approved'] });
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update booking status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle approve booking
  const handleApproveBooking = (id: number) => {
    updateBookingStatus({ id, status: "approved" });
  };

  // Handle reject booking
  const handleRejectBooking = (id: number) => {
    updateBookingStatus({ id, status: "rejected" });
  };

  // Filter bookings based on search query and status
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.dropAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.pickupDateTime.includes(searchQuery) ||
      booking.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user?.phoneNumber.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-medium text-neutral-500 mb-4 md:mb-0">Booking Requests</h2>
        <div className="flex items-center flex-col md:flex-row gap-4 md:gap-0">
          <div className="relative mr-4 w-full md:w-auto">
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2"
            />
            <Search className="h-5 w-5 absolute left-3 top-2.5 text-neutral-300" />
          </div>
          <div className="w-full md:w-auto">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="px-4 py-2 w-full md:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden mb-6">
        {isLoading ? (
          <div className="p-8 text-center">Loading booking requests...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="font-medium text-left px-6 py-4">ID</th>
                  <th className="font-medium text-left px-6 py-4">User</th>
                  <th className="font-medium text-left px-6 py-4">Purpose</th>
                  <th className="font-medium text-left px-6 py-4">Pickup</th>
                  <th className="font-medium text-left px-6 py-4">Dropoff</th>
                  <th className="font-medium text-left px-6 py-4">Date & Time</th>
                  <th className="font-medium text-left px-6 py-4">Status</th>
                  <th className="font-medium text-left px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-neutral-500">
                      No booking requests found matching your filters
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
                        </div>
                      </td>
                      <td className="px-6 py-4">{booking.purpose}</td>
                      <td className="px-6 py-4">{booking.pickupAddress}</td>
                      <td className="px-6 py-4">{booking.dropAddress}</td>
                      <td className="px-6 py-4">{booking.pickupDateTime}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${booking.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                          booking.status === 'approved' ? 'bg-green-100 text-green-600' : 
                          'bg-red-100 text-red-600'}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {booking.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="px-3 py-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveBooking(booking.id)}
                              disabled={isUpdating}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="px-3 py-1"
                              onClick={() => handleRejectBooking(booking.id)}
                              disabled={isUpdating}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-neutral-300 text-sm">Already processed</span>
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
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>
    </div>
  );
}
