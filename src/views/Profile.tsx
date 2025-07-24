import React, { useEffect } from "react";
import UserProfileComponent from "../components/UserProfile";
import SavedJobs from "../components/SavedJobs";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  const userId = localStorage.getItem("userId") || "";
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
    }
  }, [userId, token, navigate]);

  return (
    <div className="container mx-auto px-4">
      <UserProfileComponent userId={userId} />
      <SavedJobs userId={userId} />
    </div>
  );
};

export default Profile;