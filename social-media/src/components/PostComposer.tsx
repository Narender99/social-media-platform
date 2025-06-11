import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { getSocialMediaContract, createPost } from '@/lib/blockchain';

interface PostComposerProps {
  onPostCreated?: () => void;
}

export default function PostComposer({ onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address, isConnected } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isConnected) return;    try {
      setIsSubmitting(true);
      const provider = new ethers.JsonRpcProvider();
      const contract = getSocialMediaContract(provider);
      await createPost(contract, content);
      setContent('');
      onPostCreated?.();    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) return null;

  return (
    <form onSubmit={handleSubmit} className="border-b border-gray-200 p-4 dark:border-gray-800">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {address?.charAt(2).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            maxLength={280}
            className="block w-full resize-none border-0 bg-transparent p-0 text-gray-900 placeholder:text-gray-500 focus:ring-0 dark:text-white sm:text-sm sm:leading-6"
          />
          <div className="flex justify-between pt-2">
            <div className="flex items-center space-x-5">
              <div className="text-sm text-gray-500">
                {content.length}/280 characters
              </div>
            </div>            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Posting...</span>
                </div>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
