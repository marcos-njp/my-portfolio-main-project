"""
Enhanced Digital Twin RAG System for Interview Practice
Optimized for recruiter/interviewer interactions with improved responses
"""

import os
import time
from dotenv import load_dotenv
from upstash_vector import Index
from groq import Groq
from upstash_redis import Redis

# Load environment variables
load_dotenv('.env.local')

def setup_groq_client():
    """Initialize Groq client for AI responses"""
    groq_api_key = os.getenv('GROQ_API_KEY')
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY not found in .env.local")
    
    client = Groq(api_key=groq_api_key)
    print("✅ Groq client initialized (llama-3.1-8b-instant)")
    return client

def setup_vector_database():
    """Initialize Upstash Vector database"""
    print("🔄 Connecting to Upstash Vector database...")
    index = Index.from_env()
    
    # Get database info
    info = index.info()
    vector_count = getattr(info, 'vector_count', 0)
    print(f"✅ Connected to Upstash Vector - {vector_count} profile chunks indexed")
    
    return index

def setup_redis_cache():
    """Initialize Upstash Redis for caching (optional)"""
    try:
        redis_url = os.getenv('UPSTASH_REDIS_REST_URL')
        redis_token = os.getenv('UPSTASH_REDIS_REST_TOKEN')
        
        if redis_url and redis_token:
            redis_client = Redis(url=redis_url, token=redis_token)
            print("✅ Redis cache connected (optional optimization)")
            return redis_client
        else:
            print("ℹ️  Redis not configured (optional)")
            return None
    except Exception as e:
        print(f"ℹ️  Redis initialization skipped: {str(e)}")
        return None

def generate_system_prompt(context_info):
    """Generate optimized system prompt for interview scenarios"""
    return f"""You are Niño Marcos in a professional interview or networking conversation. Respond naturally in first person.

CORE IDENTITY:
- IT Student at St. Paul University Philippines (BS Information Technology, Expected 2027)
- Location: Tuguegarao City, Philippines
- Age: Young professional, eager to learn and contribute
- Open to: Remote work, internships, OJT, entry-level positions

KEY ACHIEVEMENTS:
- 🏆 4th place internationally (118 teams, 5 countries) - STEAM Challenge 2018, Programming Skills Excellence
- 🥈 5th place nationally (43 schools) - Robothon 2018, Excellence Award
- 🚀 3+ deployed production applications on Vercel
- 🤖 Built functional RAG system with Groq AI + Upstash Vector

TECHNICAL EXPERTISE:
- Frontend: Next.js 15, React, TypeScript, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, REST APIs, Prisma ORM
- Databases: PostgreSQL, Upstash Vector, Upstash Redis
- AI/ML: RAG systems, Vector databases, LLM integration (Groq AI)
- Auth: OAuth (Google), secure authentication patterns
- Languages: JavaScript (2y, Advanced), TypeScript (2y, Advanced), Python (5y, Intermediate)

NOTABLE PROJECTS:
1. AI-Powered Portfolio with RAG System - Real-time professional query answering
2. Person Search App - OAuth authentication, Prisma ORM, PostgreSQL
3. Modern Portfolio - Dark/light themes, animations, responsive design

SOFT SKILLS:
- Self-directed learner with proven track record
- International competition experience
- Strong problem-solving under pressure
- Clean code practices and documentation
- Team collaboration

CONTEXT FROM PROFILE: {context_info}

RESPONSE GUIDELINES:
- Be conversational but professional
- Use specific examples and numbers when possible
- Show enthusiasm without being over-eager
- Be honest about student status while highlighting achievements
- Keep responses concise (2-4 sentences unless asked for details)
- Use "I" statements naturally
- Show growth mindset when discussing areas for improvement"""

def search_relevant_context(query, index, redis_cache=None, top_k=3):
    """Search vector database for relevant context with optional caching"""
    cache_key = f"rag_context:{query[:50]}"
    
    # Try cache first
    if redis_cache:
        try:
            cached = redis_cache.get(cache_key)
            if cached:
                print("💨 Cache hit - using cached context")
                return eval(cached.decode())
        except:
            pass
    
    # Query vector database
    start_time = time.time()
    results = index.query(
        data=query,
        top_k=top_k,
        include_metadata=True
    )
    search_time = time.time() - start_time
    
    if not results:
        print("⚠️  No relevant context found")
        return [], 0.0, search_time
    
    # Extract context with scores
    context_parts = []
    scores = []
    
    for result in results:
        if hasattr(result, 'score') and result.score:
            scores.append(result.score)
            if result.score > 0.7:  # Relevance threshold
                metadata = getattr(result, 'metadata', {}) or {}
                category = metadata.get('category', 'general')
                context_parts.append({
                    'id': result.id,
                    'score': result.score,
                    'category': category
                })
    
    avg_score = sum(scores) / len(scores) if scores else 0.0
    
    # Cache results
    if redis_cache and context_parts:
        try:
            redis_cache.setex(cache_key, 300, str(context_parts))  # 5 min cache
        except:
            pass
    
    return context_parts, avg_score, search_time

def generate_response_with_groq(query, context_info, groq_client):
    """Generate interview response using Groq AI"""
    system_prompt = generate_system_prompt(context_info)
    
    start_time = time.time()
    
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query}
            ],
            temperature=0.7,
            max_tokens=400,
            top_p=0.9,
        )
        
        response_time = time.time() - start_time
        response = completion.choices[0].message.content.strip()
        
        return response, response_time
        
    except Exception as e:
        print(f"❌ Groq API Error: {str(e)}")
        return "I apologize, I'm having trouble responding right now. Could you rephrase your question?", 0.0

def rag_query(question, index, groq_client, redis_cache=None):
    """Execute complete RAG pipeline for interview questions"""
    print(f"\n{'='*60}")
    print(f"❓ INTERVIEWER: {question}")
    print(f"{'='*60}\n")
    
    # Step 1: Search for relevant context
    print("🔍 Searching professional profile...")
    context_parts, avg_score, search_time = search_relevant_context(
        question, index, redis_cache, top_k=3
    )
    
    # Build context summary
    if context_parts:
        context_summary = " | ".join([
            f"{c['category']} (relevance: {c['score']:.2f})"
            for c in context_parts[:2]
        ])
        print(f"📊 Found {len(context_parts)} relevant chunks (avg score: {avg_score:.3f})")
        print(f"📝 Context: {context_summary}")
    else:
        context_summary = "General profile knowledge"
        print("📝 Using general knowledge")
    
    print(f"⏱️  Search time: {search_time:.3f}s\n")
    
    # Step 2: Generate response
    print("🤖 Generating response...")
    response, response_time = generate_response_with_groq(
        question, context_summary, groq_client
    )
    
    print(f"⏱️  Response time: {response_time:.3f}s")
    print(f"\n💬 NIÑO: {response}\n")
    
    # Performance metrics
    total_time = search_time + response_time
    print(f"{'='*60}")
    print(f"📈 Performance: {total_time:.3f}s total | Search: {search_time:.3f}s | AI: {response_time:.3f}s")
    print(f"🎯 Relevance Score: {avg_score:.3f}")
    print(f"{'='*60}\n")
    
    return response

def run_interview_simulation():
    """Interactive interview simulation mode"""
    print("\n🎯 DIGITAL TWIN INTERVIEW PRACTICE MODE")
    print("="*60)
    print("🤖 AI-Powered Professional Interview Simulation")
    print("💡 System: Groq AI (llama-3.1-8b-instant) + Upstash Vector + Redis")
    print("="*60)
    
    # Setup
    try:
        groq_client = setup_groq_client()
        index = setup_vector_database()
        redis_cache = setup_redis_cache()
        print(f"\n✅ All systems ready! Interview simulation starting...\n")
    except Exception as e:
        print(f"❌ Setup failed: {str(e)}")
        return
    
    # Suggested interview questions
    suggestions = [
        "Tell me about yourself",
        "What are your technical strengths?",
        "Describe your most significant achievement",
        "Tell me about your robotics competition experience",
        "What programming languages are you proficient in?",
        "What projects have you built recently?",
        "What are your career goals?",
        "Why should we hire you?",
        "What are your salary expectations?",
        "Are you open to remote work?",
        "Describe a challenging problem you solved",
        "What technologies are you most excited about?"
    ]
    
    print("💭 SUGGESTED INTERVIEW QUESTIONS:")
    for i, suggestion in enumerate(suggestions, 1):
        print(f"   {i}. {suggestion}")
    
    print(f"\n{'='*60}")
    print("Type your question, 'exit' to quit, or a number (1-12) for suggestions")
    print(f"{'='*60}\n")
    
    # Interview loop
    while True:
        try:
            interviewer_input = input("🎤 INTERVIEWER: ").strip()
            
            if not interviewer_input:
                continue
                
            if interviewer_input.lower() in ['exit', 'quit', 'q']:
                print("\n👋 Interview simulation ended. Good luck with your real interviews!")
                break
            
            # Handle numbered suggestions
            if interviewer_input.isdigit():
                idx = int(interviewer_input) - 1
                if 0 <= idx < len(suggestions):
                    question = suggestions[idx]
                else:
                    print("❌ Invalid number. Please choose 1-12.")
                    continue
            else:
                question = interviewer_input
            
            # Execute RAG query
            rag_query(question, index, groq_client, redis_cache)
            
        except KeyboardInterrupt:
            print("\n\n👋 Interview interrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {str(e)}\n")

def main():
    """Main entry point"""
    run_interview_simulation()

if __name__ == "__main__":
    main()