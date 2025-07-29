import React, { useState } from 'react';
import { MessageSquare, Send, X, AlertCircle } from 'lucide-react';
import axios from 'axios';

const HumanFeedbackModal = ({ article, isOpen, onClose, onFeedbackSubmitted }) => {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      setError('Please provide your feedback');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`/articles/${article.id}/human-feedback`, {
        feedback: feedback.trim(),
        continue_workflow: true
      });

      // Call the callback to update the parent component
      onFeedbackSubmitted(response.data);
      
      // Close the modal
      onClose();
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(error.response?.data?.detail || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOnly = async () => {
    if (!feedback.trim()) {
      setError('Please provide your feedback');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`/articles/${article.id}/human-feedback`, {
        feedback: feedback.trim(),
        continue_workflow: false
      });

      onFeedbackSubmitted(response.data);
      onClose();
      
    } catch (error) {
      console.error('Error saving feedback:', error);
      setError(error.response?.data?.detail || 'Failed to save feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Human Feedback Required
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="mb-6">
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">
                  AI Requests Your Expert Input (Score &lt; 7)
                </h3>
                <p className="text-yellow-700 text-sm">
                  The AI has evaluated this article with a score below 7 and needs your professional judgment to improve it further. 
                  Your feedback will be incorporated into the next iteration to help reach publication standards.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Article Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Topic:</strong> {article.topic}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Current Score:</strong> {article.score}/10
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Iteration:</strong> {article.iteration}/{article.max_iteration}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong> {article.evaluation}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">AI Feedback</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{article.feedback}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Your Expert Feedback *
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide your professional feedback on how to improve this article. Consider:
• Content depth and accuracy
• Writing style and tone
• Target audience fit
• Industry-specific insights
• Engagement and virality factors
• Any missing elements or areas for improvement"
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows="8"
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Your feedback will be combined with AI feedback to create the next iteration.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSaveOnly}
                disabled={loading || !feedback.trim()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Feedback Only
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={loading || !feedback.trim()}
                  className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit & Continue
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HumanFeedbackModal; 