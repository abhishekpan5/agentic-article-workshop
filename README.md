# AI Article Generator with Iterative Workflow

A full-stack web application that uses LangGraph to generate high-quality, SEO-optimized articles through an iterative AI workflow. The system generates articles, evaluates them, and optimizes them until they meet quality standards.

## Features

- **AI-Powered Article Generation**: Uses GPT-4 to create engaging, well-researched articles
- **Iterative Optimization**: Automatically evaluates and improves articles through multiple iterations
- **Quality Assessment**: Comprehensive evaluation of originality, factuality, SEO, and engagement
- **Modern Web Interface**: React frontend with beautiful, responsive design
- **Article Management**: View, search, and manage all generated articles
- **Markdown Export**: Download articles as markdown files for easy publishing
- **Workflow History**: Track the evolution of articles through iterations

## Architecture

- **Backend**: FastAPI with LangGraph workflow
- **Frontend**: React with Tailwind CSS
- **Storage**: File-based storage (JSON + Markdown)
- **AI**: OpenAI GPT-4 for generation, evaluation, and optimization

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI application
│   └── workflow.py          # LangGraph workflow
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArticleGenerator.js
│   │   │   ├── ArticleList.js
│   │   │   └── ArticleViewer.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── articles/                # Generated articles storage
├── requirements.txt         # Python dependencies
├── main.ipynb              # Original notebook
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API key

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Iterative-workflow-medium-blog
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Usage

### Generating Articles

1. Navigate to the "Generate" tab
2. Enter your article topic
3. Select the number of iterations (recommended: 5)
4. Click "Generate Article"
5. Wait for the AI to complete the iterative workflow

### Managing Articles

1. Go to the "Articles" tab to view all generated articles
2. Search articles by topic
3. View article details, feedback, and iteration history
4. Download articles as markdown files
5. Delete articles as needed

### Article Workflow

The system follows this iterative process:

1. **Generate**: AI creates an initial article based on the topic
2. **Evaluate**: AI evaluates the article for quality, SEO, and engagement
3. **Optimize**: If needed, AI improves the article based on feedback
4. **Repeat**: Steps 2-3 continue until the article is approved or max iterations reached

## API Endpoints

- `POST /generate-article` - Generate a new article
- `GET /articles` - List all articles
- `GET /articles/{id}` - Get specific article
- `DELETE /articles/{id}` - Delete article
- `GET /articles/{id}/markdown` - Download article as markdown

## Customization

### Modifying the Workflow

Edit `backend/workflow.py` to:
- Change AI models
- Modify evaluation criteria
- Adjust optimization prompts
- Add new workflow steps

### Styling

The frontend uses Tailwind CSS. Modify `frontend/tailwind.config.js` and component files to customize the design.

### Storage

Currently uses file-based storage. For production, consider:
- Database storage (PostgreSQL, MongoDB)
- Cloud storage (AWS S3, Google Cloud Storage)
- Redis for caching

## Production Deployment

### Backend Deployment

```bash
# Using Gunicorn
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Deployment

```bash
cd frontend
npm run build
# Deploy the build folder to your hosting service
```

### Environment Variables for Production

```env
OPENAI_API_KEY=your_production_api_key
CORS_ORIGINS=https://yourdomain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the API documentation at http://localhost:8000/docs
2. Review the workflow logic in `backend/workflow.py`
3. Open an issue on GitHub

## Acknowledgments

- Built with [LangGraph](https://github.com/langchain-ai/langgraph)
- Powered by [OpenAI GPT-4](https://openai.com/)
- Frontend built with [React](https://reactjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- Backend built with [FastAPI](https://fastapi.tiangolo.com/) 