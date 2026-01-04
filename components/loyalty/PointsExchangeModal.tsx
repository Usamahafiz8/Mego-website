'use client';

import { useState, useEffect } from 'react';
import { X, Coins, Gift, Zap } from 'lucide-react';
import { pointsExchangeApi, loyaltyApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface ExchangeOption {
  id: string;
  name: string;
  type: 'coins' | 'recharge' | 'boost';
  pointsRequired: number;
  value: number;
  description: string;
}

interface PointsExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number;
  onExchangeSuccess: () => void;
}

export function PointsExchangeModal({ isOpen, onClose, currentPoints, onExchangeSuccess }: PointsExchangeModalProps) {
  const [options, setOptions] = useState<ExchangeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ExchangeOption | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const fetchOptions = async () => {
    try {
      const response = await pointsExchangeApi.getOptions();
      setOptions(response.data || []);
    } catch (error) {
      // If API fails, use default options
      setOptions([
        { id: '1', name: '100 MEGO Coins', type: 'coins', pointsRequired: 100, value: 100, description: 'Convert 100 points to coins' },
        { id: '2', name: '500 MEGO Coins', type: 'coins', pointsRequired: 450, value: 500, description: 'Convert 450 points to coins' },
        { id: '3', name: '1000 MEGO Coins', type: 'coins', pointsRequired: 800, value: 1000, description: 'Convert 800 points to coins' },
        { id: '4', name: 'Ad Boost (7 days)', type: 'boost', pointsRequired: 200, value: 7, description: 'Boost your ad for 7 days' },
        { id: '5', name: 'Ad Boost (30 days)', type: 'boost', pointsRequired: 700, value: 30, description: 'Boost your ad for 30 days' },
      ]);
    }
  };

  const handleExchange = async () => {
    if (!selectedOption) {
      toast.error('Please select an option');
      return;
    }

    const totalPoints = selectedOption.pointsRequired * quantity;
    if (totalPoints > currentPoints) {
      toast.error('Insufficient points');
      return;
    }

    setLoading(true);
    try {
      await pointsExchangeApi.exchange({
        optionId: selectedOption.id,
        amount: quantity,
      });
      toast.success(`Successfully exchanged ${totalPoints} points!`);
      onExchangeSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to exchange points');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'coins':
        return <Coins className="w-6 h-6" />;
      case 'boost':
        return <Zap className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Redeem Points</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available Points</p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{currentPoints.toLocaleString()}</p>
          </div>

          <div className="space-y-3 mb-6">
            {options.map((option) => {
              const totalCost = option.pointsRequired * quantity;
              const canAfford = totalCost <= currentPoints;
              
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    selectedOption?.id === option.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!canAfford}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
                        {getIcon(option.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{option.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600 dark:text-primary-400">
                        {option.pointsRequired} pts
                      </p>
                      {selectedOption?.id === option.id && (
                        <div className="mt-2 flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            max={Math.floor(currentPoints / option.pointsRequired)}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            onClick={(e) => e.stopPropagation()}
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            = {totalCost} pts
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedOption && (
            <div className="flex space-x-4">
              <button
                onClick={handleExchange}
                disabled={loading || selectedOption.pointsRequired * quantity > currentPoints}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : `Exchange ${selectedOption.pointsRequired * quantity} Points`}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




