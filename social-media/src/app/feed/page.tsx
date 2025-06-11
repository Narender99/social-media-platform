'use client';

import { useState, useEffect } from 'react';
import { useAccount, useProvider } from 'wagmi';
import { ethers } from 'ethers';
import Navbar from '@/components/Navbar';
import PostComposer from '@/components/PostComposer';
import Post from '@/components/Post';
import { getSocialMediaContract, getPosts, getProfile } from '@/lib/blockchain';

export interface Post {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  likes: number;
  comments: number;
}

interface EnrichedPost extends Post {
  authorDetails: {
    address: string;
    username: string;
    profilePic?: string;
  };
}

export default function FeedPage() {
  const { isConnected } = useAccount();
  const provider = useProvider();
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) return;
    loadPosts();
    setupEventListeners();
  }, [isConnected, provider]);

  const loadPosts = async () => {
    try {
      const contract = getSocialMediaContract(provider);
      const rawPosts = await getPosts(contract);
      const enrichedPosts = await Promise.all(
        rawPosts.map(async (post: Post) => {
          const [username, _, profilePic] = await getProfile(contract, post.author);
          return {
            ...post,
            authorDetails: {
              address: post.author,
              username: username || post.author.slice(0, 6) + '...' + post.author.slice(-4),
              profilePic,
            },
          };
        })
      );
      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    const contract = getSocialMediaContract(provider);

    contract.on('PostCreated', (postId, author, content, timestamp) => {
      const newPost: Post = {
        id: postId.toString(),
        content,
        author,
        timestamp: new Date(timestamp * 1000).toISOString(),
        likes: 0,
        comments: 0,
      };
      enrichAndAddPost(newPost);
    });

    return () => {
      contract.removeAllListeners('PostCreated');
    };
  };

  const enrichAndAddPost = async (post: Post) => {
    const contract = getSocialMediaContract(provider);
    const [username, _, profilePic] = await getProfile(contract, post.author);
    const enrichedPost: EnrichedPost = {
      ...post,
      authorDetails: {
        address: post.author,
        username: username || post.author.slice(0, 6) + '...' + post.author.slice(-4),
        profilePic,
      },
    };
    setPosts(prev => [enrichedPost, ...prev]);
  };

  if (!isConnected) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen flex-col">
          <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Please connect your wallet to view the feed
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
            <PostComposer onPostCreated={loadPosts} />
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {posts.map((post) => (
                  <Post
                    key={post.id}
                    id={post.id}
                    content={post.content}
                    author={post.authorDetails}
                    timestamp={post.timestamp}
                    likes={post.likes}
                    comments={post.comments}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
