import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { HeartIcon, ChatBubbleOvalLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { getSocialMediaContract, likePost, unlikePost, addComment, getComments } from '@/lib/blockchain';

interface PostProps {
  id: string;
  content: string;
  author: {
    address: string;
    username: string;
    profilePic?: string;
  };
  timestamp: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export default function Post({ id, content, author, timestamp, likes, comments: commentCount, isLiked: initialIsLiked = false }: PostProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(likes);
  const { address } = useAccount();  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleLike = async () => {
    if (!address || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const provider = new ethers.JsonRpcProvider();
      const contract = getSocialMediaContract(provider);
      
      if (isLiked) {
        await unlikePost(contract, parseInt(id));
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await likePost(contract, parseInt(id));
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert the optimistic update if there's an error
      setIsLiked(initialIsLiked);
      setLikesCount(likes);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleOpenCommentDialog = async () => {
    setIsCommentDialogOpen(true);
    await loadComments();
  };

  const loadComments = async () => {
    try {
      setIsLoadingComments(true);
      const provider = new ethers.JsonRpcProvider();
      const contract = getSocialMediaContract(provider);
      const comments = await getComments(contract, parseInt(id));
      setComments(comments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !address || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const provider = new ethers.JsonRpcProvider();
      const contract = getSocialMediaContract(provider);
      await addComment(contract, parseInt(id), commentContent);
      setCommentContent('');
      await loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <>
      <div className="border-b border-gray-200 p-4 dark:border-gray-800">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            {author.profilePic ? (
              <img
                className="h-10 w-10 rounded-full"
                src={author.profilePic}
                alt={author.username}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {author.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-900 dark:text-white">
                {author.username || formatAddress(author.address)}
              </p>
              <span className="text-sm text-gray-500">·</span>
              <span className="text-sm text-gray-500">{timestamp}</span>
            </div>
            <p className="mt-1 text-gray-900 dark:text-white">{content}</p>
            <div className="mt-2 flex space-x-6">
              <button
                type="button"
                onClick={handleLike}
                disabled={isSubmitting}
                className={`flex items-center space-x-2 ${
                  isSubmitting ? 'cursor-not-allowed opacity-50' : ''
                } ${
                  isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                {isLiked ? (
                  <HeartIconSolid className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                <span className="text-sm">
                  {isSubmitting ? '...' : likesCount}
                </span>
              </button>
              <button
                type="button"
                onClick={handleOpenCommentDialog}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
              >
                <ChatBubbleOvalLeftIcon className="h-5 w-5" />
                <span className="text-sm">{commentCount}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Dialog */}
      {isCommentDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsCommentDialogOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900" />
            </div>

            <div className="inline-block w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800 sm:my-8">
              <div className="absolute right-0 top-0 p-4">
                <button
                  type="button"
                  onClick={() => setIsCommentDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-3 sm:mt-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Comments</h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmitComment} className="mb-4">
                    <textarea
                      rows={2}
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Write a comment..."
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={!commentContent.trim() || isSubmittingComment}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </form>

                  {isLoadingComments ? (
                    <div className="flex justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{formatAddress(comment.author)}</span>
                            <span className="text-sm text-gray-500">{comment.timestamp}</span>
                          </div>
                          <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p className="text-center text-gray-500">No comments yet</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
