import React, { useEffect } from "react";
import { useUser } from "../context/UserContext.shared";
import UserProfileComponent from "../components/UserProfile";
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
  <div className="container max-w-7xl mx-auto px-4">
      <div className="flex w-full mb-8 items-start">
        <div className="flex-[4_5_0%] min-w-0 pr-6">
          <UserProfileComponent userId={userId} />
        </div>
        <div className="divider divider-horizontal" />
        <div className="flex-[4_0_0%] min-w-0 pl-6">
          <ConnectionsComponent userId={userId} accessToken={token} />
        </div>
      </div>
  </div>
  );
};

export default Profile;