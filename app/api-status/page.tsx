'use client';

import React from 'react';

export default function APIStatusPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
                <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-8 text-center">
                    API Status Checker
                </h1>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-800">
                    <APIStatusChecker />
                </div>
            </div>
        </div>
    );
}

function APIStatusChecker() {
    const [status, setStatus] = React.useState<'checking' | 'online' | 'offline' | 'error'>('checking');
    const [apiUrl, setApiUrl] = React.useState('');
    const [responseTime, setResponseTime] = React.useState<number | null>(null);
    const [errorMessage, setErrorMessage] = React.useState('');

    React.useEffect(() => {
        checkAPI();
    }, []);

    const checkAPI = async () => {
        setStatus('checking');
        const url = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.9.196';
        setApiUrl(url);

        const startTime = performance.now();

        try {
            const response = await fetch(`${url}/v1/ads`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000), // 10 second timeout
            });

            const endTime = performance.now();
            setResponseTime(Math.round(endTime - startTime));

            if (response.ok) {
                setStatus('online');
                const data = await response.json();
                console.log('✅ API Response:', data);
            } else {
                setStatus('error');
                setErrorMessage(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error: any) {
            const endTime = performance.now();
            setResponseTime(Math.round(endTime - startTime));
            setStatus('offline');

            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                setErrorMessage('Request timed out after 10 seconds');
            } else if (error.message.includes('Failed to fetch')) {
                setErrorMessage('Cannot connect to server. Check if backend is running and CORS is configured.');
            } else {
                setErrorMessage(error.message || 'Unknown error');
            }

            console.error('❌ API Error:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${status === 'checking' ? 'bg-yellow-500 animate-pulse' :
                        status === 'online' ? 'bg-green-500' :
                            'bg-red-500'
                        }`} />
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {status === 'checking' ? 'Checking...' :
                            status === 'online' ? 'Online' :
                                status === 'offline' ? 'Offline' :
                                    'Error'}
                    </span>
                </div>
                <button
                    onClick={checkAPI}
                    className="px-4 py-2 bg-primary-900 text-white rounded-xl hover:bg-primary-800 transition-colors font-semibold"
                >
                    Recheck
                </button>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">API URL:</label>
                    <p className="text-gray-900 dark:text-white font-mono text-sm bg-white dark:bg-black p-3 rounded-lg mt-1 break-all">
                        {apiUrl || 'Loading...'}
                    </p>
                </div>

                {responseTime !== null && (
                    <div>
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Response Time:</label>
                        <p className="text-gray-900 dark:text-white font-mono text-sm bg-white dark:bg-black p-3 rounded-lg mt-1">
                            {responseTime}ms
                        </p>
                    </div>
                )}

                {errorMessage && (
                    <div>
                        <label className="text-sm font-semibold text-red-600 dark:text-red-400">Error:</label>
                        <p className="text-red-900 dark:text-red-300 font-mono text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-lg mt-1">
                            {errorMessage}
                        </p>
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Troubleshooting:</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                        <span className="text-primary-900 dark:text-primary-400">1.</span>
                        <span>Check if backend server is running</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary-900 dark:text-primary-400">2.</span>
                        <span>Verify NEXT_PUBLIC_API_URL in .env.local</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary-900 dark:text-primary-400">3.</span>
                        <span>Ensure CORS is configured on backend</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary-900 dark:text-primary-400">4.</span>
                        <span>Check network/firewall settings</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
