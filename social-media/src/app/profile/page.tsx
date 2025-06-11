'use client';

import { useState, useEffect } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import Navbar from '@/components/Navbar';
import Post from '@/components/Post';
import { getProfile, updateProfile, getSocialMediaContract } from '@/lib/blockchain';

interface ProfileFormData {
  username: string;
  bio: string;
  profilePicUrl: string;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    username: '',
    bio: '',
    profilePicUrl: '',
  });
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      loadProfileData();
    }
  }, [isConnected, address]);

  const loadProfileData = async () => {
    try {
      const contract = getSocialMediaContract(provider);
      const [username, bio, profilePicUrl] = await getProfile(contract, address!);
      setProfileData({ username, bio, profilePicUrl });
      // TODO: Load user's posts
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;

    try {
      const contract = getSocialMediaContract(provider);
      await updateProfile(
        contract,
        profileData.username,
        profileData.bio,
        profileData.profilePicUrl
      );
      setIsEditing(false);
      // Reload profile data to confirm changes
      await loadProfileData();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!isConnected) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen flex-col">
          <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Please connect your wallet to view your profile
            </p>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="container mx-auto flex flex-1 flex-col px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-2xl">
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <>
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          value={profileData.username}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, username: e.target.value }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          rows={3}
                          value={profileData.bio}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label htmlFor="profilePicUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Profile Picture URL
                        </label>
                        <input
                          type="url"
                          id="profilePicUrl"
                          value={profileData.profilePicUrl}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, profilePicUrl: e.target.value }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {profileData.profilePicUrl ? (
                            <img
                              src={profileData.profilePicUrl}
                              alt={profileData.username}
                              className="h-16 w-16 rounded-full"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                              <span className="text-2xl font-medium text-gray-600 dark:text-gray-400">
                                {profileData.username?.charAt(0)?.toUpperCase() || address?.charAt(2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <h1 className="text-xl font-bold">{profileData.username || address}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{address}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Edit Profile
                        </button>
                      </div>
                      {profileData.bio && (
                        <p className="text-gray-700 dark:text-gray-300">{profileData.bio}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Your Posts</h2>
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <Post key={post.id} {...post} />
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No posts yet
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}