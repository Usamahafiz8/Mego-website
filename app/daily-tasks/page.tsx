'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { loyaltyApi } from '@/lib/api';
import { CheckCircle2, Circle, Star, RefreshCw, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  taskType: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  frequency: string;
}

export default function DailyTasksPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchTasks();
    
    // Auto-refresh every 2 minutes (reduced frequency for better performance)
    const interval = setInterval(() => {
      fetchTasks();
    }, 120000);

    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await loyaltyApi.getTasks();
      setTasks(res.data || []);
    } catch (error: any) {
      console.error('Tasks fetch error', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    toast.success('Tasks refreshed!');
  };

  const handleCompleteTask = async (task: Task) => {
    if (task.completed || completing) return;
    
    try {
      setCompleting(task.taskType);
      await loyaltyApi.completeTask(task.taskType, task.points);
      toast.success(`✅ ${task.title} completed! +${task.points} points`);
      await fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Task already completed today');
    } finally {
      setCompleting(null);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Daily & Weekly Tasks
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Complete tasks to earn bonus points every day
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Refresh Tasks"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Circle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No tasks available at the moment</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const disabled = task.completed || completing === task.taskType;
              const isDaily = task.frequency?.toLowerCase() === 'daily';
              
              return (
                <div
                  key={task.taskType || task.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${
                    task.completed
                      ? 'border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                  } p-6 transition-all duration-300`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        task.completed
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-gradient-to-br from-primary-500 to-secondary-500'
                      }`}>
                        {task.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Star className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {task.title}
                          </h3>
                          {isDaily ? (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-semibold flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>DAILY</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs font-semibold flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>WEEKLY</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {task.description}
                        </p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-primary-600 dark:text-primary-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-bold">+{task.points} points</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {task.completed ? (
                        <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-semibold flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Completed</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCompleteTask(task)}
                          disabled={disabled}
                          className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                            disabled
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                          }`}
                        >
                          {completing === task.taskType ? (
                            <span className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Completing...</span>
                            </span>
                          ) : (
                            'Complete Task'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
            <Star className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span>How it works</span>
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 dark:text-primary-400">•</span>
              <span>Complete daily tasks to earn points every day</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 dark:text-primary-400">•</span>
              <span>Weekly tasks reset every Monday</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 dark:text-primary-400">•</span>
              <span>Points can be redeemed for coins, boosts, and mobile packages</span>
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}

