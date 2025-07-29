import React, { useState } from 'react';
import { Eye, Download, Trash2, Clock, CheckCircle, AlertCircle, FileText, Star, MessageSquare } from 'lucide-react';

const ArticleList = ({ articles, loading, onSelectArticle, onDeleteArticle, onDownloadMarkdown, onProvideFeedback }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArticles = articles.filter(article =>
    article.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
    if (score >= 9) return 'text-green-600 bg-green-100';
    if (score >= 7) return 'text-blue-600 bg-blue-100';
    if (score >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreText = (score) => {
    if (score >= 9) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 5) return 'Average';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Saved Articles ({articles.length})
            </h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="divide-y divide-gray-200">
          {filteredArticles.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No articles found' : 'No articles yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Generate your first article to get started'
                }
              </p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div key={article.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {article.topic}
                      </h3>
                      {getStatusIcon(article.evaluation)}
                      {article.needs_human_feedback && (
                        <div className="flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Needs Feedback
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(article.created_at)}
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {article.iteration}/{article.max_iteration} iterations
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        article.evaluation === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStatusText(article.evaluation)}
                      </span>
                      {article.score && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(article.score)}`}>
                            {article.score}/10 - {getScoreText(article.score)}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2">
                      {article.final_article.substring(0, 200)}...
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {article.needs_human_feedback && (
                      <button
                        onClick={() => onProvideFeedback(article)}
                        className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
                        title="Provide human feedback"
                      >
                        <MessageSquare className="h-5 w-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => onSelectArticle(article)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      title="View article"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => onDownloadMarkdown(article.id, article.topic)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      title="Download markdown"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => onDeleteArticle(article.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete article"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleList; 