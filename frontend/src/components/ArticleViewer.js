import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Download, CheckCircle, AlertCircle, Clock, RefreshCw, Star, MessageSquare } from 'lucide-react';

const ArticleViewer = ({ article, onBack, onDownloadMarkdown, onProvideFeedback }) => {
  const [activeTab, setActiveTab] = useState('article');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (evaluation) => {
    return evaluation === 'approved' ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertCircle className="h-5 w-5 text-yellow-500" />
    );
  };

  const getStatusText = (evaluation) => {
    return evaluation === 'approved' ? 'Approved' : 'Needs Improvement';
  };

  const getScoreColor = (score) => {
    if (score >= 9) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 7) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (score >= 5) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getScoreText = (score) => {
    if (score >= 9) return 'Excellent - Publication Ready';
    if (score >= 7) return 'Good - Needs Minor Improvements';
    if (score >= 5) return 'Average - Requires Significant Work';
    return 'Poor - Needs Complete Rewrite';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{article.topic}</h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDate(article.created_at)}
                  </div>
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {article.iteration}/{article.max_iteration} iterations
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {getStatusIcon(article.evaluation)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  article.evaluation === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {getStatusText(article.evaluation)}
                </span>
              </div>
              
              {article.score && (
                <div className={`flex items-center px-3 py-1 rounded-full border ${getScoreColor(article.score)}`}>
                  <Star className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {article.score}/10
                  </span>
                </div>
              )}
              
              {article.needs_human_feedback && onProvideFeedback && (
                <button
                  onClick={() => onProvideFeedback(article)}
                  className="flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Provide Feedback
                </button>
              )}
              
              <button
                onClick={() => onDownloadMarkdown(article.id, article.topic)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Markdown
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('article')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'article'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Article
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'feedback'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Feedback
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {activeTab === 'article' && (
          <div className="p-8">
            <div className="prose prose-lg max-w-none article-content">
              <ReactMarkdown>{article.final_article}</ReactMarkdown>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Assessment</h3>
              
              {article.score && (
                <div className="mb-6">
                  <div className={`p-4 rounded-lg border ${getScoreColor(article.score)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 mr-2" />
                        <h4 className="font-medium text-lg">Quality Score: {article.score}/10</h4>
                      </div>
                      <span className="text-sm font-medium">
                        {getScoreText(article.score)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`p-4 rounded-lg border ${
                article.evaluation === 'approved' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start">
                  {getStatusIcon(article.evaluation)}
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">
                      Final Evaluation: {getStatusText(article.evaluation)}
                    </h4>
                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">{article.feedback}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Human Feedback History */}
            {article.human_feedback_history && article.human_feedback_history.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Human Feedback History</h3>
                <div className="space-y-4">
                  {article.human_feedback_history.map((feedback, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">
                          Human Feedback - Iteration {index + 1}
                        </span>
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Feedback History */}
            {article.feedback_history && article.feedback_history.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Feedback History</h3>
                <div className="space-y-4">
                  {article.feedback_history.map((feedback, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          AI Feedback - Iteration {index + 1}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Evolution</h3>
            <div className="space-y-6">
              {article.article_history && article.article_history.map((version, index) => (
                <div key={index} className="border rounded-lg">
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <h4 className="font-medium text-gray-900">
                      Version {index + 1} {index === article.article_history.length - 1 && '(Final)'}
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="prose prose-sm max-w-none article-content">
                      <ReactMarkdown>{version}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleViewer; 