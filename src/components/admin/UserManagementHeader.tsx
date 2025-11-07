
// @ts-nocheck
import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface UserManagementHeaderProps {
  onAddUser: () => void;
}

const UserManagementHeader = ({ onAddUser }: UserManagementHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
      <h1 className="text-2xl font-bold">User Management</h1>
      <Button onClick={onAddUser}>
        <UserPlus className="mr-2 h-4 w-4" />
        Add User
      </Button>
    </div>
  );
};

export default UserManagementHeader;
