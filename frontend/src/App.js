import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, FileText, Download, Trash2, Eye, Clock } from 'lucide-react';
import ArticleGenerator from './components/ArticleGenerator';
import ArticleList from './components/ArticleList';
import ArticleViewer from './components/ArticleViewer';
import HumanFeedbackModal from './components/HumanFeedbackModal';
import './App.css';

function App() {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [articleNeedingFeedback, setArticleNeedingFeedback] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/articles');
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleGenerated = (newArticle) => {
    setArticles([newArticle, ...articles]);
    setSelectedArticle(newArticle);
    setActiveTab('view');
    
    // Check if the new article needs human feedback
    if (newArticle.needs_human_feedback) {
      setArticleNeedingFeedback(newArticle);
      setFeedbackModalOpen(true);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    try {
      await axios.delete(`/articles/${articleId}`);
      setArticles(articles.filter(article => article.id !== articleId));
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle(null);
        setActiveTab('generate');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleDownloadMarkdown = async (articleId, topic) => {
    try {
      const response = await axios.get(`/articles/${articleId}/markdown`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${topic.replace(/\s+/g, '_')}.md`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading markdown:', error);
    }
  };

  const handleProvideFeedback = (article) => {
    setArticleNeedingFeedback(article);
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSubmitted = (updatedArticle) => {
    // Update the articles list with the new article data
    setArticles(articles.map(article => 
      article.id === updatedArticle.id ? updatedArticle : article
    ));
    
    // Update selected article if it's the same one
    if (selectedArticle && selectedArticle.id === updatedArticle.id) {
      setSelectedArticle(updatedArticle);
    }
    
    // If the article is now approved, show it in the viewer
    if (updatedArticle.evaluation === 'approved') {
      setSelectedArticle(updatedArticle);
      setActiveTab('view');
    }
    
    // Check if more feedback is needed
    if (updatedArticle.needs_human_feedback) {
      setArticleNeedingFeedback(updatedArticle);
      setFeedbackModalOpen(true);
    }
  };

  const closeFeedbackModal = () => {
    setFeedbackModalOpen(false);
    setArticleNeedingFeedback(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                Article Generator
              </h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'generate'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Generate
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'articles'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Articles
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generate' && (
          <ArticleGenerator onArticleGenerated={handleArticleGenerated} />
        )}
        
        {activeTab === 'articles' && (
          <ArticleList
            articles={articles}
            loading={loading}
            onSelectArticle={(article) => {
              setSelectedArticle(article);
              setActiveTab('view');
            }}
            onDeleteArticle={handleDeleteArticle}
            onDownloadMarkdown={handleDownloadMarkdown}
            onProvideFeedback={handleProvideFeedback}
          />
        )}
        
        {activeTab === 'view' && selectedArticle && (
          <ArticleViewer
            article={selectedArticle}
            onBack={() => setActiveTab('articles')}
            onDownloadMarkdown={handleDownloadMarkdown}
            onProvideFeedback={handleProvideFeedback}
          />
        )}
      </main>

      {/* Human Feedback Modal */}
      {articleNeedingFeedback && (
        <HumanFeedbackModal
          article={articleNeedingFeedback}
          isOpen={feedbackModalOpen}
          onClose={closeFeedbackModal}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  );
}

export default App; 