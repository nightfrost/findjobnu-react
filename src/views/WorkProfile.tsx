// Legacy WorkProfile route retained to avoid broken links. Work profile data is now part of unified UserProfile.
import React from "react";
import { useUser } from "../context/UserContext";
import UserProfileComponent from "../components/UserProfile";

const WorkProfile: React.FC = () => {
  const { user } = useUser();
  const userId = user?.userId || "";
  return (
    <div className="container mx-auto px-4">
      <UserProfileComponent userId={userId} />
    </div>
  );
};

export default WorkProfile;
