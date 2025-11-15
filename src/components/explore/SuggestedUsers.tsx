import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/utils/formatters";

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  verified: boolean;
  followers: number; // Restored followers field
}

interface SuggestedUsersProps {
  users: SuggestedUser[];
}

const SuggestedUsers = ({ users }: SuggestedUsersProps) => {
  return (
    <div className="mt-4 space-y-4">
      {users.length > 0 ? (
        users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                {user.verified && (
                  <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center">
                  <span className="font-semibold">{user.name}</span>
                  {user.verified && (
                    <Badge variant="outline" className="ml-1 bg-blue-500 p-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                <p className="text-xs text-muted-foreground">{formatNumber(user.followers)} followers</p> {/* Restored followers display */}
              </div>
            </div>
            <button className="text-sm font-semibold text-blue-500">Follow</button>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No users found</p>
        </div>
      )}
    </div>
  );
};

export default SuggestedUsers;