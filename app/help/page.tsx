'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { supportApi } from '@/lib/api';
import { HelpCircle, MessageSquare, Send, ChevronDown, ChevronUp, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const faqs = [
  {
    question: 'How do I post an ad?',
    answer: 'Click on "Post Ad" button, upload a photo, add title and description, set price and category. Your ad will be reviewed and approved within 24 hours.',
  },
  {
    question: 'How do I verify my account?',
    answer: 'Go to Settings > KYC Verification and submit your CNIC photo and selfie. Our team will review and approve within 48 hours.',
  },
  {
    question: 'How do I earn points?',
    answer: 'Earn points by posting ads, completing daily tasks, referring friends, and engaging with the platform. Check the Loyalty Center for all ways to earn.',
  },
  {
    question: 'How do I contact a seller?',
    answer: 'Click on any ad and use the "Contact Seller" button to start a conversation. You can send messages, images, and voice notes.',
  },
  {
    question: 'What is the refund policy?',
    answer: 'MEGO is a marketplace platform. All transactions are between buyers and sellers. We recommend meeting in person and verifying items before purchase.',
  },
  {
    question: 'How do I report a fake ad?',
    answer: 'Click on the ad, scroll down and click "Report this ad". Select the reason and provide details. Our team will review and take action.',
  },
];

export default function HelpPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
    category: 'general',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to submit a support ticket');
      router.push('/login');
      return;
    }

    if (!ticketForm.subject || !ticketForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      await supportApi.createTicket(ticketForm);
      toast.success('Support ticket submitted successfully!');
      setTicketForm({ subject: '', message: '', category: 'general' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 animate-fadeInUp">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-4 flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/50 dark:to-secondary-900/50 rounded-2xl">
              <HelpCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            Help & Support
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Find answers to common questions or contact our support team
          </p>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <div className="bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800 p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Phone Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available 24/7</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
              +92 300 1234567
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800 p-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Email Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Response within 24 hours</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
              support@mego.pk
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800 p-6 md:p-8 mb-8 animate-fadeInUp shadow-soft" style={{ animationDelay: '200ms' }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support Ticket Form */}
        <div className="bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800 p-6 md:p-8 animate-fadeInUp shadow-soft" style={{ animationDelay: '300ms' }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <MessageSquare className="w-6 h-6 mr-2" />
            Submit Support Ticket
          </h2>
          <form onSubmit={handleSubmitTicket} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={ticketForm.category}
                onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Issue</option>
                <option value="payment">Payment Issue</option>
                <option value="account">Account Issue</option>
                <option value="report">Report Abuse</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={ticketForm.message}
                onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="Describe your issue in detail..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>{submitting ? 'Submitting...' : 'Submit Ticket'}</span>
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}




