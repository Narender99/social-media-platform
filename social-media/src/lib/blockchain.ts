import { ethers } from 'ethers';

// TODO: Replace with actual contract address after deployment
export const SOCIAL_MEDIA_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export const SOCIAL_MEDIA_CONTRACT_ABI = [
  // Events
  'event PostCreated(uint256 indexed postId, address indexed author, string content, uint256 timestamp)',
  'event PostLiked(uint256 indexed postId, address indexed liker)',
  'event PostUnliked(uint256 indexed postId, address indexed unliker)',
  'event CommentAdded(uint256 indexed postId, uint256 indexed commentId, address indexed author, string content)',
  'event ProfileUpdated(address indexed user, string username, string bio, string profilePicUrl)',

  // Core Functions
  'function createPost(string calldata content) external',
  'function likePost(uint256 postId) external',
  'function unlikePost(uint256 postId) external',
  'function addComment(uint256 postId, string calldata content) external',
  'function updateProfile(string calldata username, string calldata bio, string calldata profilePicUrl) external',
  
  // View Functions
  'function getPosts(uint256 offset, uint256 limit) external view returns (tuple(uint256 id, address author, string content, uint256 timestamp, uint256 likes, uint256 comments)[] memory)',
  'function getPost(uint256 postId) external view returns (tuple(uint256 id, address author, string content, uint256 timestamp, uint256 likes, uint256 comments))',
  'function getComments(uint256 postId) external view returns (tuple(uint256 id, address author, string content, uint256 timestamp)[] memory)',
  'function getProfile(address user) external view returns (string memory username, string memory bio, string memory profilePicUrl)',
  'function isPostLiked(uint256 postId, address user) external view returns (bool)',
];

export function getSocialMediaContract(provider: ethers.Provider) {
  if (!SOCIAL_MEDIA_CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }
  return new ethers.Contract(SOCIAL_MEDIA_CONTRACT_ADDRESS, SOCIAL_MEDIA_CONTRACT_ABI, provider);
}

export async function createPost(contract: ethers.Contract, content: string) {
  const tx = await contract.createPost(content);
  const receipt = await tx.wait();
  return receipt;
}

export async function likePost(contract: ethers.Contract, postId: number) {
  const tx = await contract.likePost(postId);
  const receipt = await tx.wait();
  return receipt;
}

export async function unlikePost(contract: ethers.Contract, postId: number) {
  const tx = await contract.unlikePost(postId);
  const receipt = await tx.wait();
  return receipt;
}

export async function addComment(contract: ethers.Contract, postId: number, content: string) {
  const tx = await contract.addComment(postId, content);
  const receipt = await tx.wait();
  return receipt;
}

export async function updateProfile(
  contract: ethers.Contract,
  username: string,
  bio: string,
  profilePicUrl: string
) {
  const tx = await contract.updateProfile(username, bio, profilePicUrl);
  const receipt = await tx.wait();
  return receipt;
}

export async function getPosts(
  contract: ethers.Contract,
  offset = 0,
  limit = 10
) {
  const posts = await contract.getPosts(offset, limit);
  return posts.map(formatPost);
}

export async function getPost(contract: ethers.Contract, postId: number) {
  const post = await contract.getPost(postId);
  return formatPost(post);
}

export async function getComments(contract: ethers.Contract, postId: number) {
  const comments = await contract.getComments(postId);
  return comments.map(formatComment);
}

export async function getProfile(contract: ethers.Contract, address: string) {
  return await contract.getProfile(address);
}

export async function isPostLiked(contract: ethers.Contract, postId: number, address: string) {
  return await contract.isPostLiked(postId, address);
}

// Helper functions to format data
function formatPost(post: any) {
  return {
    id: post.id.toString(),
    author: post.author,
    content: post.content,
    timestamp: new Date(post.timestamp * 1000).toISOString(),
    likes: post.likes.toNumber(),
    comments: post.comments.toNumber(),
  };
}

function formatComment(comment: any) {
  return {
    id: comment.id.toString(),
    author: comment.author,
    content: comment.content,
    timestamp: new Date(comment.timestamp * 1000).toISOString(),
  };
}