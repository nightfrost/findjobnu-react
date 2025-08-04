import React, { useEffect } from "react";
import { useUser } from "../context/UserContext";
import UserProfileComponent from "../components/UserProfile";
import SavedJobs from "../components/SavedJobs";
import ConnectionsComponent from "../components/Connections";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  const { user } = useUser();
  const userId = user?.userId || "";
  const token = user?.accessToken || "";
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
    }
  }, [userId, token, navigate]);

  return (
    <div className="container mx-auto px-4">
      {/* Top section with UserProfile and Connections side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <UserProfileComponent userId={userId} />
        <ConnectionsComponent userId={userId} accessToken={token} />
      </div>
      
      {/* Bottom section with SavedJobs spanning full width */}
      <div className="w-full">
        <SavedJobs userId={userId} />
      </div>
    </div>
  );
};

export default Profile;