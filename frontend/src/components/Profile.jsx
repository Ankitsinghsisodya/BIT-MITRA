import React from "react";
import { Outlet } from "react-router-dom";

function Profile() {
  return (
    <div>
      sidebar
      <div>
        <Outlet></Outlet>
      </div>
    </div>
  );
}

export default Profile;
