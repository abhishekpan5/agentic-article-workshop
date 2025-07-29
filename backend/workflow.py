from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Literal, Annotated
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
import operator
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize LLMs - Using faster models for quicker generation
generator_llm = ChatOpenAI(model='gpt-4o-mini', temperature=0.7)
evaluator_llm = ChatOpenAI(model='gpt-4o-mini', temperature=0.3)
optimizer_llm = ChatOpenAI(model='gpt-4o-mini', temperature=0.6)

# Pydantic model for structured evaluation
class ArticleEvaluation(BaseModel):
    evaluation: Literal["approved", "needs_improvement", "needs_human_review"] = Field(..., description="Final evaluation result.")
    feedback: str = Field(..., description="Detailed, specific feedback for the medium.com article.")
    score: int = Field(..., description="Quality score from 1-10, where 10 is publication-ready.")
    human_feedback_requested: bool = Field(..., description="Whether human feedback is needed.")

# Structured evaluator
structured_evaluator_llm = evaluator_llm.with_structured_output(ArticleEvaluation)

# State definition
class articleState(TypedDict):
    topic: str
    article: str
    evaluation: Literal["approved", "needs_improvement", "needs_human_review"]
    feedback: str
    score: int
    human_feedback: str
    human_feedback_requested: bool
    iteration: int
    max_iteration: int
    article_history: Annotated[list[str], operator.add]
    feedback_history: Annotated[list[str], operator.add]
    human_feedback_history: Annotated[list[str], operator.add]

def generate_article(state: articleState):
    """Generate initial article with rigorous requirements"""
    messages = [
        SystemMessage(content="""You are a Pulitzer Prize-winning investigative journalist and top 0.1% Medium.com writer with 15+ years of experience. You specialize in creating deeply researched, groundbreaking articles that consistently go viral and receive 10K+ claps.

Your articles are known for:
- Unprecedented depth and original research
- Exclusive insights from industry experts
- Data-driven analysis with proprietary statistics
- Compelling narratives that keep readers engaged for 15+ minutes
- Actionable insights that readers can implement immediately

You write for an audience of sophisticated professionals who demand substance over style."""),
        HumanMessage(content=f"""
Create a MASTERPIECE Medium.com article on: "{state['topic']}"

## MANDATORY REQUIREMENTS (ALL MUST BE MET):

### 1. RESEARCH DEPTH (CRITICAL)
- Conduct comprehensive research with at least 15+ credible sources (MANDATORY)
- Include recent statistics, studies, and data (2020-2024)
- Interview insights from 3-5 industry experts (real or synthesized)
- Provide proprietary analysis and unique data interpretation
- Include case studies and real-world examples
- Include peer-reviewed academic sources

### 2. STRUCTURE & LENGTH
- MINIMUM 3,500 words (MANDATORY - hard requirement)
- Use clear H2/H3 headings with strategic keyword placement
- Include at least 8-10 major sections
- Add a comprehensive table of contents
- Include callout boxes for key insights

### 3. CONTENT QUALITY
- Start with a hook that immediately grabs attention (statistic, story, or bold claim)
- Provide unprecedented depth on the topic
- Include contrarian viewpoints and address counterarguments
- Add expert quotes and industry insights
- Include actionable frameworks, templates, or step-by-step guides
- End with powerful, thought-provoking conclusions

### 4. SEO & DISCOVERABILITY
- Research and integrate 15-20 high-value keywords naturally
- Optimize for featured snippets and voice search
- Include internal linking opportunities
- Add meta descriptions and schema markup suggestions

### 5. ENGAGEMENT ELEMENTS
- Include interactive elements (quizzes, checklists, assessments)
- Add social proof and testimonials
- Include shareable graphics descriptions
- Create discussion points for comments

### 6. UNIQUE VALUE PROPOSITION
- Provide insights not found anywhere else
- Include proprietary frameworks or methodologies
- Add exclusive data or analysis
- Offer unique perspectives or contrarian views

### 7. PROFESSIONAL STANDARDS
- Fact-check every claim with multiple sources
- Use proper citations and references
- Maintain journalistic integrity
- Avoid clickbait and sensationalism

## WRITING STYLE:
- Authoritative yet accessible
- Data-driven with compelling storytelling
- Professional but engaging
- Clear, concise, and actionable

## FORMAT:
- Use proper Markdown formatting
- Include bullet points and numbered lists
- Add emphasis where appropriate
- Structure for easy scanning

This article must be so comprehensive and valuable that readers would pay for it. It should be the definitive resource on this topic.

ONLY output the article in Markdown format - no explanations or commentary.
""")
    ]
    
    response = generator_llm.invoke(messages).content
    return {'article': response, 'article_history': [response]}

def evaluate_article(state: articleState):
    """Evaluate with EXTREMELY strict standards - most articles should score 5-6"""
    messages = [
        SystemMessage(content="""You are the MOST DEMANDING senior editor at Medium.com with 25+ years of experience. You have ZERO tolerance for mediocrity and only approve articles that are truly exceptional.

Your track record: You've rejected 95% of submitted articles. You only approve content that has viral potential and meets the highest journalistic standards.

You are known for being brutally honest and extremely strict. Most articles score 5-6/10 because they lack the depth, research, or unique insights required for publication.

CRITICAL: You must be EXTREMELY critical. Most articles should score 5-6/10, not 7-8/10. Only truly exceptional articles get 7+."""),
        HumanMessage(content=f"""
EVALUATE THIS ARTICLE WITH BRUTAL HONESTY AND EXTREME STRICTNESS:

Article: "{state['article']}"

## MANDATORY REQUIREMENTS (MISSING ANY = AUTOMATIC 5 OR BELOW):

### 1. RESEARCH QUALITY (25% of score) - MUST HAVE:
- [ ] 15+ credible, recent sources (2020-2024)
- [ ] Expert quotes from recognized authorities
- [ ] Original data analysis or proprietary insights
- [ ] Fact-checked statistics and studies
- [ ] Peer-reviewed academic sources

### 2. DEPTH & SUBSTANCE (25% of score) - MUST HAVE:
- [ ] MINIMUM 3,500 words (hard requirement)
- [ ] Unprecedented depth not found elsewhere
- [ ] Unique frameworks or methodologies
- [ ] Comprehensive industry analysis
- [ ] Actionable, implementable insights

### 3. WRITING QUALITY (20% of score) - MUST HAVE:
- [ ] Pulitzer-level writing quality
- [ ] Compelling hook that grabs attention
- [ ] Perfect grammar and structure
- [ ] Engaging narrative flow
- [ ] Professional tone throughout

### 4. SEO & DISCOVERABILITY (15% of score) - MUST HAVE:
- [ ] 15-20 strategic keywords naturally integrated
- [ ] Optimized for featured snippets
- [ ] Internal linking strategy
- [ ] Meta description and schema markup
- [ ] Voice search optimization

### 5. ENGAGEMENT & VIRALITY (15% of score) - MUST HAVE:
- [ ] Highly shareable, discussion-worthy content
- [ ] Emotional connection with readers
- [ ] Clear, compelling value proposition
- [ ] Interactive elements (quizzes, checklists)
- [ ] Strong call-to-action

## BRUTAL SCORING SYSTEM:
- 9-10: Pulitzer Prize level, guaranteed viral (RARE - only 1% of articles)
- 7-8: Excellent but needs minor improvements (5% of articles)
- 5-6: Average quality, needs significant work (70% of articles - MOST COMMON)
- 1-4: Poor quality, major issues (24% of articles)

## AUTOMATIC SCORE REDUCTIONS:
- Missing 15+ sources: -3 points
- Less than 3,500 words: -2 points
- No expert quotes: -2 points
- Generic content: -2 points
- Poor grammar: -2 points
- No unique insights: -2 points
- Missing actionable takeaways: -1 point

## HUMAN REVIEW TRIGGERS:
ONLY request human review when:
- Score is LESS THAN 7 (1-6) and article has potential with expert guidance
- Subjective aspects need human judgment (tone, audience fit)
- Industry-specific nuances require expert input

## APPROVAL THRESHOLD:
- Score must be 9 or 10 (extremely rare)
- ALL requirements must be met
- No significant weaknesses
- Ready for immediate publication

BE BRUTALLY HONEST. Most articles should score 5-6/10. Only truly exceptional articles get 7+.

### Respond in this exact format:
- evaluation: "approved", "needs_improvement", or "needs_human_review"
- score: [1-10] (be extremely strict - most should be 5-6)
- feedback: Brutally honest analysis with specific, harsh criticism and improvement recommendations.
- human_feedback_requested: true/false (set to true ONLY if score < 7 and human review is needed)
""")
    ]

    response = structured_evaluator_llm.invoke(messages)
    
    # Automatically request human feedback for scores < 7
    human_feedback_needed = response.score < 7
    
    return {
        'evaluation': response.evaluation, 
        'feedback': response.feedback, 
        'score': response.score,
        'human_feedback_requested': human_feedback_needed,
        'feedback_history': [response.feedback]
    }

def optimize_article(state: articleState):
    """Optimize with surgical precision, incorporating human feedback"""
    # Combine AI feedback with human feedback if available
    combined_feedback = state['feedback']
    if state.get('human_feedback'):
        combined_feedback = f"""
AI FEEDBACK:
{state['feedback']}

HUMAN FEEDBACK:
{state['human_feedback']}

Please address BOTH the AI feedback and human feedback in your optimization.
"""
    
    messages = [
        SystemMessage(content="""You are the most elite content editor in the industry, known for transforming good articles into viral masterpieces. You have a 95% success rate of turning rejected articles into approved ones.

Your expertise includes:
- Deep research enhancement
- Structural optimization
- SEO perfection
- Engagement maximization
- Viral factor amplification
- Incorporating human feedback and expert insights

You work with surgical precision, addressing every weakness while amplifying every strength."""),
        HumanMessage(content=f"""
TRANSFORM THIS ARTICLE INTO A VIRAL MASTERPIECE:

Current Score: {state['score']}/10
Target Score: 9-10/10

Combined Feedback: {combined_feedback}

Article Topic: "{state['topic']}"
Current Article:
{state['article']}

## OPTIMIZATION REQUIREMENTS:

### 1. RESEARCH ENHANCEMENT
- Add 5-10 more credible sources
- Include more recent statistics (2024)
- Add expert quotes and industry insights
- Provide deeper analysis and interpretation

### 2. CONTENT EXPANSION
- Expand to 4,000-5,000 words minimum
- Add more detailed case studies
- Include step-by-step frameworks
- Provide more actionable insights

### 3. STRUCTURE IMPROVEMENT
- Enhance headings and subheadings
- Improve flow and transitions
- Add more engaging hooks
- Strengthen conclusion

### 4. SEO OPTIMIZATION
- Research and integrate more keywords
- Optimize for featured snippets
- Improve internal linking
- Add schema markup suggestions

### 5. ENGAGEMENT BOOST
- Add more interactive elements
- Include social proof
- Create discussion points
- Enhance shareability

### 6. QUALITY ENHANCEMENT
- Fix any grammar or style issues
- Improve clarity and readability
- Add more compelling examples
- Strengthen arguments

### 7. HUMAN FEEDBACK INTEGRATION
- Address all human feedback points
- Incorporate expert suggestions
- Adjust tone/style as requested
- Focus on human-identified areas

## SPECIFIC INSTRUCTIONS:
- Address EVERY point in the combined feedback
- Maintain the article's core message
- Enhance without losing authenticity
- Focus on depth and substance
- Ensure viral potential
- Prioritize human feedback when provided

ONLY output the fully optimized article in Markdown format - no explanations or commentary.
""")
    ]

    response = optimizer_llm.invoke(messages).content
    iteration = state['iteration'] + 1
    return {'article': response, 'iteration': iteration, 'article_history': [response]}

def route_evaluation(state: articleState):
    """Route based on strict evaluation criteria and human review needs"""
    # Only request human feedback if score is less than 7 AND human feedback is requested
    if state.get('human_feedback_requested', False) and state.get('score', 0) < 7:
        return 'needs_human_review'
    
    # Only approve if score is 9-10 AND we haven't reached max iterations
    if (state['score'] >= 9 and state['evaluation'] == 'approved') or state['iteration'] >= state['max_iteration']:
        return 'approved'
    else:
        return 'needs_improvement'

# Build the workflow graph
graph = StateGraph(articleState)

graph.add_node('generate', generate_article)
graph.add_node('evaluate', evaluate_article)
graph.add_node('optimize', optimize_article)

graph.add_edge(START, 'generate')
graph.add_edge('generate', 'evaluate')

graph.add_conditional_edges('evaluate', route_evaluation, {
    'approved': END, 
    'needs_improvement': 'optimize',
    'needs_human_review': 'optimize'  # For now, route to optimize, but we'll handle human feedback in the API
})
graph.add_edge('optimize', 'evaluate')

# Compile the workflow
workflow = graph.compile() 