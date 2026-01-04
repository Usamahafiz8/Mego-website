'use client';

import { useState } from 'react';
import { Smile, X } from 'lucide-react';
import { chatReactionsApi } from '@/lib/api';
import toast from 'react-hot-toast';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface ChatReactionsProps {
  messageId: string;
  reactions: Array<{ emoji: string; userId: string; userName: string }>;
  currentUserId: string;
  onReactionUpdate: () => void;
}

export function ChatReactions({ messageId, reactions, currentUserId, onReactionUpdate }: ChatReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleAddReaction = async (emoji: string) => {
    try {
      await chatReactionsApi.add(messageId, emoji);
      onReactionUpdate();
      setShowPicker(false);
    } catch (error) {
      toast.error('Failed to add reaction');
    }
  };

  const handleRemoveReaction = async (emoji: string) => {
    try {
      await chatReactionsApi.remove(messageId, emoji);
      onReactionUpdate();
    } catch (error) {
      toast.error('Failed to remove reaction');
    }
  };

  const groupedReactions = REACTIONS.map((emoji) => {
    const reactionUsers = reactions.filter((r) => r.emoji === emoji);
    const hasUserReaction = reactionUsers.some((r) => r.userId === currentUserId);
    return {
      emoji,
      count: reactionUsers.length,
      hasUserReaction,
      users: reactionUsers,
    };
  }).filter((r) => r.count > 0);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
      >
        <Smile className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-2 z-20 flex space-x-2">
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleAddReaction(emoji)}
                className="text-2xl hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}

      {groupedReactions.length > 0 && (
        <div className="flex items-center space-x-1 mt-1">
          {groupedReactions.map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() =>
                reaction.hasUserReaction
                  ? handleRemoveReaction(reaction.emoji)
                  : handleAddReaction(reaction.emoji)
              }
              className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 transition-colors ${
                reaction.hasUserReaction
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}




