import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

const ArticleGenerator = ({ onArticleGenerated }) => {
  const [topic, setTopic] = useState('');
  const [maxIterations, setMaxIterations] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/generate-article', {
        topic: topic.trim(),
        max_iterations: maxIterations
      });

      setSuccess('Article generated successfully!');
      onArticleGenerated(response.data);
      
      // Reset form
      setTopic('');
      setMaxIterations(5);
      
    } catch (error) {
      console.error('Error generating article:', error);
      setError(error.response?.data?.detail || 'Failed to generate article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center mb-8">
          <Sparkles className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Generate AI-Powered Articles
          </h2>
          <p className="text-gray-600 text-lg">
            Create high-quality, SEO-optimized articles using our iterative AI workflow
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Input */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Article Topic *
            </label>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter the topic for your article (e.g., 'The Future of AI in Healthcare')"
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows="3"
              disabled={loading}
            />
          </div>

          {/* Max Iterations */}
          <div>
            <label htmlFor="maxIterations" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Iterations
            </label>
            <select
              id="maxIterations"
              value={maxIterations}
              onChange={(e) => setMaxIterations(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading}
            >
              <option value={3}>3 iterations</option>
              <option value={5}>5 iterations (recommended)</option>
              <option value={7}>7 iterations</option>
              <option value={10}>10 iterations</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              More iterations may improve quality but take longer to generate
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="loading-spinner mr-3"></div>
                Generating Article...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Article
              </>
            )}
          </button>
        </form>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How it works</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <div className="font-medium text-gray-900 mb-1">1. Generate</div>
              <p>AI creates an initial article based on your topic</p>
            </div>
            <div>
              <div className="font-medium text-gray-900 mb-1">2. Evaluate</div>
              <p>AI evaluates the article for quality, SEO, and engagement</p>
            </div>
            <div>
              <div className="font-medium text-gray-900 mb-1">3. Optimize</div>
              <p>AI iteratively improves the article until it meets quality standards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleGenerator; 