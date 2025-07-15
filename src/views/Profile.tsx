import React from "react";
import UserProfileComponent from "../components/UserProfile";

const Profile: React.FC = () => {
  // You may want to get userId from your auth context/provider
  const userId = localStorage.getItem("userId") || "";

  return (
    <div className="container mx-auto px-4">
      <UserProfileComponent userId={userId} />
    </div>
  );
};

export default Profile;