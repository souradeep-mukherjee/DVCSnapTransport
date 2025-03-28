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
  employeeNumber: string;
  department: string;
  status: string;
}

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users/pending'],
  });

  // Update user status
  const { mutate: updateUserStatus, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PUT', '/api/admin/users/status', { id, status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/pending'] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update user status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle approve user
  const handleApproveUser = (id: number) => {
    updateUserStatus({ id, status: "approved" });
  };

  // Handle reject user
  const handleRejectUser = (id: number) => {
    updateUserStatus({ id, status: "rejected" });
  };

  // Filter users based on search query and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber.includes(searchQuery) ||
      user.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-medium text-neutral-500 mb-4 md:mb-0">User Management</h2>
        <div className="flex items-center flex-col md:flex-row gap-4 md:gap-0">
          <div className="relative mr-4 w-full md:w-auto">
            <Input
              placeholder="Search users..."
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
          <div className="p-8 text-center">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="font-medium text-left px-6 py-4">Name</th>
                  <th className="font-medium text-left px-6 py-4">Email</th>
                  <th className="font-medium text-left px-6 py-4">Phone</th>
                  <th className="font-medium text-left px-6 py-4">Employee #</th>
                  <th className="font-medium text-left px-6 py-4">Department</th>
                  <th className="font-medium text-left px-6 py-4">Status</th>
                  <th className="font-medium text-left px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-neutral-500">
                      No users found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-neutral-200">
                      <td className="px-6 py-4">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.phoneNumber}</td>
                      <td className="px-6 py-4">{user.employeeNumber}</td>
                      <td className="px-6 py-4">{user.department}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${user.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                          user.status === 'approved' ? 'bg-green-100 text-green-600' : 
                          'bg-red-100 text-red-600'}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="px-3 py-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveUser(user.id)}
                              disabled={isUpdating}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="px-3 py-1"
                              onClick={() => handleRejectUser(user.id)}
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
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>
  );
}
