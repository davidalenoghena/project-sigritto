import React from "react";

const User: React.FC = () => {
  const userProfile = {
    name: "John Doe",
    role: "Software Engineer",
    email: "john.doe@example.com",
    location: "New York, USA",
    bio: "Passionate about building great software and solving complex problems.",
    avatarUrl: "https://via.placeholder.com/150", // Placeholder image URL
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0 p-6">
            <img
              className="h-48 w-48 rounded-full object-cover"
              src={userProfile.avatarUrl}
              alt={`${userProfile.name}'s profile`}
            />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              {userProfile.role}
            </div>
            <h2 className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900">
              {userProfile.name}
            </h2>
            <p className="mt-2 text-gray-600">
              <span className="font-medium">Email: </span>
              {userProfile.email}
            </p>
            <p className="mt-2 text-gray-600">
              <span className="font-medium">Location: </span>
              {userProfile.location}
            </p>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">Bio</h3>
              <p className="mt-2 text-gray-600">{userProfile.bio}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
