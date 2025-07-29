from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import aiofiles
import os
import json
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
import uuid
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import the workflow from the notebook
from workflow import workflow

app = FastAPI(title="Article Generation API", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create articles directory if it doesn't exist
ARTICLES_DIR = "articles"
os.makedirs(ARTICLES_DIR, exist_ok=True)

# Pydantic models for API
class ArticleRequest(BaseModel):
    topic: str
    max_iterations: int = 5

class HumanFeedbackRequest(BaseModel):
    feedback: str
    continue_workflow: bool = True

class ArticleResponse(BaseModel):
    id: str
    topic: str
    final_article: str
    evaluation: str
    feedback: str
    score: int
    human_feedback_requested: bool
    iteration: int
    max_iteration: int
    article_history: List[str]
    feedback_history: List[str]
    human_feedback_history: List[str]
    created_at: str
    status: str
    needs_human_feedback: bool = False

class ArticleListResponse(BaseModel):
    articles: List[dict]

# In-memory storage for running jobs and pending human feedback
running_jobs = {}
pending_human_feedback = {}

@app.get("/")
async def root():
    return {"message": "Article Generation API"}

@app.post("/generate-article", response_model=ArticleResponse)
async def generate_article(request: ArticleRequest, background_tasks: BackgroundTasks):
    """Generate an article using the LangGraph workflow"""
    try:
        # Create initial state
        initial_state = {
            "topic": request.topic,
            "iteration": 1,
            "max_iteration": request.max_iterations,
            "human_feedback": "",
            "human_feedback_history": []
        }
        
        # Run the workflow
        result = workflow.invoke(initial_state)
        
        # Generate unique ID for the article
        article_id = str(uuid.uuid4())
        
        # Check if human feedback is needed
        needs_human_feedback = (
            result.get("human_feedback_requested", False) and 
            result.get("evaluation") != "approved" and
            result.get("score", 0) < 7
        )
        
        # Create response
        article_response = ArticleResponse(
            id=article_id,
            topic=result["topic"],
            final_article=result["article"],
            evaluation=result["evaluation"],
            feedback=result["feedback"],
            score=result.get("score", 0),
            human_feedback_requested=result.get("human_feedback_requested", False),
            iteration=result["iteration"],
            max_iteration=result["max_iteration"],
            article_history=result["article_history"],
            feedback_history=result["feedback_history"],
            human_feedback_history=result.get("human_feedback_history", []),
            created_at=datetime.now().isoformat(),
            status="completed" if result.get("evaluation") == "approved" else "needs_improvement",
            needs_human_feedback=needs_human_feedback
        )
        
        # If human feedback is needed, store the current state
        if needs_human_feedback:
            pending_human_feedback[article_id] = {
                "state": result,
                "topic": request.topic,
                "max_iterations": request.max_iterations
            }
        
        # Save article to file
        background_tasks.add_task(save_article_to_file, article_response)
        
        return article_response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating article: {str(e)}")

@app.post("/articles/{article_id}/human-feedback")
async def provide_human_feedback(article_id: str, feedback_request: HumanFeedbackRequest):
    """Provide human feedback and continue the workflow"""
    try:
        if article_id not in pending_human_feedback:
            raise HTTPException(status_code=404, detail="Article not found or no human feedback needed")
        
        # Get the current state
        current_state = pending_human_feedback[article_id]["state"]
        topic = pending_human_feedback[article_id]["topic"]
        max_iterations = pending_human_feedback[article_id]["max_iterations"]
        
        # Add human feedback to the state
        current_state["human_feedback"] = feedback_request.feedback
        current_state["human_feedback_history"] = current_state.get("human_feedback_history", []) + [feedback_request.feedback]
        
        if feedback_request.continue_workflow:
            # Continue the workflow from the current state
            result = workflow.invoke(current_state)
            
            # Update the article
            needs_human_feedback = (
                result.get("human_feedback_requested", False) and 
                result.get("evaluation") != "approved" and
                result.get("score", 0) < 7
            )
            
            # Update the stored state if more feedback is needed
            if needs_human_feedback:
                pending_human_feedback[article_id]["state"] = result
            else:
                # Remove from pending feedback if workflow is complete
                del pending_human_feedback[article_id]
            
            # Update the article file
            updated_article = ArticleResponse(
                id=article_id,
                topic=result["topic"],
                final_article=result["article"],
                evaluation=result["evaluation"],
                feedback=result["feedback"],
                score=result.get("score", 0),
                human_feedback_requested=result.get("human_feedback_requested", False),
                iteration=result["iteration"],
                max_iteration=result["max_iteration"],
                article_history=result["article_history"],
                feedback_history=result["feedback_history"],
                human_feedback_history=result.get("human_feedback_history", []),
                created_at=datetime.now().isoformat(),
                status="completed" if result.get("evaluation") == "approved" else "needs_improvement",
                needs_human_feedback=needs_human_feedback
            )
            
            # Save updated article
            await save_article_to_file(updated_article)
            
            return updated_article
        else:
            # Just save the human feedback without continuing
            # Load existing article
            filepath = os.path.join(ARTICLES_DIR, f"{article_id}.json")
            if os.path.exists(filepath):
                async with aiofiles.open(filepath, 'r') as f:
                    content = await f.read()
                    article_data = json.loads(content)
                
                # Update with human feedback
                article_data["human_feedback_history"] = current_state.get("human_feedback_history", [])
                article_data["needs_human_feedback"] = False
                article_data["status"] = "human_feedback_provided"
                
                # Save updated article
                async with aiofiles.open(filepath, 'w') as f:
                    await f.write(json.dumps(article_data, indent=2))
                
                # Remove from pending feedback
                del pending_human_feedback[article_id]
                
                return article_data
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing human feedback: {str(e)}")

@app.get("/articles/{article_id}/needs-feedback")
async def check_needs_feedback(article_id: str):
    """Check if an article needs human feedback"""
    return {
        "needs_feedback": article_id in pending_human_feedback,
        "current_state": pending_human_feedback.get(article_id, {})
    }

@app.get("/articles", response_model=ArticleListResponse)
async def list_articles():
    """List all saved articles"""
    try:
        articles = []
        if os.path.exists(ARTICLES_DIR):
            for filename in os.listdir(ARTICLES_DIR):
                if filename.endswith('.json'):
                    try:
                        filepath = os.path.join(ARTICLES_DIR, filename)
                        async with aiofiles.open(filepath, 'r') as f:
                            content = await f.read()
                            article_data = json.loads(content)
                                                    # Check if this article needs human feedback
                        article_id = filename.replace('.json', '')
                        # Check if score < 7 and not approved, or if it's in pending feedback
                        needs_feedback = (
                            (article_data.get('score', 0) < 7 and article_data.get('evaluation') != 'approved') or
                            article_id in pending_human_feedback
                        )
                        article_data["needs_human_feedback"] = needs_feedback
                        articles.append(article_data)
                    except Exception as e:
                        print(f"Error reading article file {filename}: {str(e)}")
                        continue
        
        # Sort by creation date (newest first)
        articles.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return ArticleListResponse(articles=articles)
        
    except Exception as e:
        print(f"Error in list_articles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing articles: {str(e)}")

@app.get("/articles/{article_id}")
async def get_article(article_id: str):
    """Get a specific article by ID"""
    try:
        filepath = os.path.join(ARTICLES_DIR, f"{article_id}.json")
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Article not found")
        
        async with aiofiles.open(filepath, 'r') as f:
            content = await f.read()
            article_data = json.loads(content)
            # Check if this article needs human feedback
            article_data["needs_human_feedback"] = article_id in pending_human_feedback
            return article_data
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving article: {str(e)}")

@app.delete("/articles/{article_id}")
async def delete_article(article_id: str):
    """Delete an article by ID"""
    try:
        filepath = os.path.join(ARTICLES_DIR, f"{article_id}.json")
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Article not found")
        
        os.remove(filepath)
        
        # Remove from pending feedback if exists
        if article_id in pending_human_feedback:
            del pending_human_feedback[article_id]
        
        return {"message": "Article deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting article: {str(e)}")

@app.get("/articles/{article_id}/markdown")
async def get_article_markdown(article_id: str):
    """Get the article content as markdown file"""
    try:
        filepath = os.path.join(ARTICLES_DIR, f"{article_id}.json")
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Article not found")
        
        async with aiofiles.open(filepath, 'r') as f:
            content = await f.read()
            article_data = json.loads(content)
            
        # Create markdown content
        markdown_content = f"""# {article_data['topic']}

{article_data['final_article']}

---
*Generated on: {article_data['created_at']}*
*Iterations: {article_data['iteration']}/{article_data['max_iteration']}*
*Status: {article_data['evaluation']}*
*Quality Score: {article_data.get('score', 'N/A')}/10*
"""
        
        # Add human feedback if available
        if article_data.get('human_feedback_history'):
            markdown_content += f"\n## Human Feedback History\n\n"
            for i, feedback in enumerate(article_data['human_feedback_history'], 1):
                markdown_content += f"### Iteration {i} Human Feedback\n\n{feedback}\n\n"
        
        # Save markdown file
        markdown_filepath = os.path.join(ARTICLES_DIR, f"{article_id}.md")
        async with aiofiles.open(markdown_filepath, 'w') as f:
            await f.write(markdown_content)
        
        return FileResponse(
            markdown_filepath,
            media_type='text/markdown',
            filename=f"{article_data['topic'].replace(' ', '_')}.md"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating markdown: {str(e)}")

async def save_article_to_file(article: ArticleResponse):
    """Save article to JSON file"""
    try:
        filepath = os.path.join(ARTICLES_DIR, f"{article.id}.json")
        async with aiofiles.open(filepath, 'w') as f:
            await f.write(json.dumps(article.model_dump(), indent=2))
    except Exception as e:
        print(f"Error saving article: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 