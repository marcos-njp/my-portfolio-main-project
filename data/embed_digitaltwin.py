"""
Digital Twin Embedding Script
Converts digitaltwin.json into content chunks and uploads to Upstash Vector Database
Based on Step 3 of Digital Twin Workshop
"""

import os
import json
from dotenv import load_dotenv
from upstash_vector import Index
from groq import Groq

# Load environment variables
load_dotenv('../.env.local')

# Constants
JSON_FILE = "digitaltwin.json"
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
UPSTASH_VECTOR_REST_URL = os.getenv('UPSTASH_VECTOR_REST_URL')
UPSTASH_VECTOR_REST_TOKEN = os.getenv('UPSTASH_VECTOR_REST_TOKEN')

def setup_upstash_client():
    """Setup Upstash Vector client"""
    if not UPSTASH_VECTOR_REST_URL or not UPSTASH_VECTOR_REST_TOKEN:
        print("❌ UPSTASH_VECTOR credentials not found in .env file")
        return None
    
    try:
        index = Index(
            url=UPSTASH_VECTOR_REST_URL,
            token=UPSTASH_VECTOR_REST_TOKEN
        )
        print("✅ Upstash Vector client initialized successfully!")
        return index
    except Exception as e:
        print(f"❌ Error initializing Upstash Vector client: {str(e)}")
        return None

def create_content_chunks(profile_data):
    """Convert digitaltwin.json into content chunks for embedding"""
    chunks = []
    chunk_id = 1
    
    # Personal Information
    personal = profile_data.get('personal', {})
    chunks.append({
        "id": f"chunk_{chunk_id}",
        "title": "Personal Profile",
        "type": "personal_info",
        "content": f"Name: {personal.get('name', 'N/A')}. Title: {personal.get('title', 'N/A')}. Location: {personal.get('location', 'N/A')}. Summary: {personal.get('summary', 'N/A')}. Elevator Pitch: {personal.get('elevator_pitch', 'N/A')}",
        "metadata": {
            "category": "personal",
            "tags": ["profile", "introduction", "summary"]
        }
    })
    chunk_id += 1
    
    # Contact Information
    contact = personal.get('contact', {})
    chunks.append({
        "id": f"chunk_{chunk_id}",
        "title": "Contact Information",
        "type": "contact",
        "content": f"Email: {contact.get('email', 'N/A')}. LinkedIn: {contact.get('linkedin', 'N/A')}. GitHub: {contact.get('github', 'N/A')}. Portfolio: {contact.get('portfolio', 'N/A')}",
        "metadata": {
            "category": "contact",
            "tags": ["contact", "social", "links"]
        }
    })
    chunk_id += 1
    
    # Salary and Location Preferences
    salary_location = profile_data.get('salary_location', {})
    chunks.append({
        "id": f"chunk_{chunk_id}",
        "title": "Salary and Location Preferences",
        "type": "compensation",
        "content": f"Current Status: {salary_location.get('current_status', 'N/A')}. Salary Expectations: {salary_location.get('salary_expectations', 'N/A')}. Location Preferences: {', '.join(salary_location.get('location_preferences', []))}. Relocation Willing: {salary_location.get('relocation_willing', False)}. Remote Experience: {salary_location.get('remote_experience', 'N/A')}. Work Authorization: {salary_location.get('work_authorization', 'N/A')}. Student Status: {salary_location.get('student_status', 'N/A')}",
        "metadata": {
            "category": "compensation",
            "tags": ["salary", "location", "remote", "relocation"]
        }
    })
    chunk_id += 1
    
    # Experience - Process each role separately
    experience = profile_data.get('experience', [])
    for exp in experience:
        # Main experience details
        chunks.append({
            "id": f"chunk_{chunk_id}",
            "title": f"Experience at {exp.get('company', 'Unknown')}",
            "type": "experience",
            "content": f"Company: {exp.get('company', 'N/A')}. Title: {exp.get('title', 'N/A')}. Duration: {exp.get('duration', 'N/A')}. Company Context: {exp.get('company_context', 'N/A')}. Team Structure: {exp.get('team_structure', 'N/A')}. Technical Skills Used: {', '.join(exp.get('technical_skills_used', []))}. Leadership Examples: {', '.join(exp.get('leadership_examples', []))}",
            "metadata": {
                "category": "experience",
                "tags": ["work", "employment", "company", exp.get('company', '').lower().replace(' ', '_')]
            }
        })
        chunk_id += 1
        
        # STAR achievements
        achievements = exp.get('achievements_star', [])
        for achievement in achievements:
            chunks.append({
                "id": f"chunk_{chunk_id}",
                "title": f"Achievement at {exp.get('company', 'Unknown')}",
                "type": "achievement",
                "content": f"Situation: {achievement.get('situation', 'N/A')}. Task: {achievement.get('task', 'N/A')}. Action: {achievement.get('action', 'N/A')}. Result: {achievement.get('result', 'N/A')}",
                "metadata": {
                    "category": "achievements",
                    "tags": ["star", "accomplishment", "results", "impact"]
                }
            })
            chunk_id += 1
    
    # Technical Skills
    skills = profile_data.get('skills', {})
    technical = skills.get('technical', {})
    
    # Programming Languages
    prog_langs = technical.get('programming_languages', [])
    if prog_langs:
        lang_details = []
        for lang in prog_langs:
            lang_details.append(f"{lang.get('language', 'Unknown')}: {lang.get('years', 0)} years, {lang.get('proficiency', 'Unknown')} level, frameworks: {', '.join(lang.get('frameworks', []))}")
        
        chunks.append({
            "id": f"chunk_{chunk_id}",
            "title": "Programming Languages",
            "type": "technical_skills",
            "content": f"Programming Languages: {'. '.join(lang_details)}",
            "metadata": {
                "category": "skills",
                "tags": ["programming", "languages", "technical"]
            }
        })
        chunk_id += 1
    
    # Other Technical Skills
    other_skills = []
    if technical.get('databases'):
        other_skills.append(f"Databases: {', '.join(technical['databases'])}")
    if technical.get('cloud_platforms'):
        other_skills.append(f"Cloud Platforms: {', '.join(technical['cloud_platforms'])}")
    if technical.get('frontend'):
        other_skills.append(f"Frontend: {', '.join(technical['frontend'])}")
    if technical.get('backend'):
        other_skills.append(f"Backend: {', '.join(technical['backend'])}")
    if technical.get('ai_ml'):
        other_skills.append(f"AI/ML: {', '.join(technical['ai_ml'])}")
    
    if other_skills:
        chunks.append({
            "id": f"chunk_{chunk_id}",
            "title": "Technical Skills and Tools",
            "type": "technical_skills",
            "content": ". ".join(other_skills),
            "metadata": {
                "category": "skills",
                "tags": ["technical", "tools", "frameworks"]
            }
        })
        chunk_id += 1
    
    # Soft Skills
    soft_skills = skills.get('soft_skills', [])
    if soft_skills:
        chunks.append({
            "id": f"chunk_{chunk_id}",
            "title": "Soft Skills",
            "type": "soft_skills",
            "content": f"Soft Skills: {', '.join(soft_skills)}",
            "metadata": {
                "category": "skills",
                "tags": ["soft", "interpersonal", "communication"]
            }
        })
        chunk_id += 1
    
    # Education
    education = profile_data.get('education', {})
    chunks.append({
        "id": f"chunk_{chunk_id}",
        "title": "Education Background",
        "type": "education",
        "content": f"University: {education.get('university', 'N/A')}. Degree: {education.get('degree', 'N/A')}. Graduation Year: {education.get('graduation_year', 'N/A')}. Location: {education.get('location', 'N/A')}. Status: {education.get('status', 'N/A')}. Relevant Coursework: {', '.join(education.get('relevant_coursework', []))}. Previous Education: {education.get('previous_education', 'N/A')}",
        "metadata": {
            "category": "education",
            "tags": ["university", "degree", "academic"]
        }
    })
    chunk_id += 1
    
    # Projects Portfolio
    projects = profile_data.get('projects_portfolio', [])
    for project in projects:
        chunks.append({
            "id": f"chunk_{chunk_id}",
            "title": f"Project: {project.get('name', 'Unknown')}",
            "type": "project",
            "content": f"Name: {project.get('name', 'N/A')}. Description: {project.get('description', 'N/A')}. Technologies: {', '.join(project.get('technologies', []))}. Impact: {project.get('impact', 'N/A')}. Key Features: {', '.join(project.get('key_features', []))}. GitHub: {project.get('github_url', 'N/A')}. Demo: {project.get('live_demo', 'N/A')}",
            "metadata": {
                "category": "projects",
                "tags": ["project", "portfolio", "demo", project.get('name', '').lower().replace(' ', '_')]
            }
        })
        chunk_id += 1
    
    # Career Goals
    career_goals = profile_data.get('career_goals', {})
    chunks.append({
        "id": f"chunk_{chunk_id}",
        "title": "Career Goals and Aspirations",
        "type": "career_goals",
        "content": f"Short Term: {career_goals.get('short_term', 'N/A')}. Long Term: {career_goals.get('long_term', 'N/A')}. Learning Focus: {', '.join(career_goals.get('learning_focus', []))}. Industries Interested: {', '.join(career_goals.get('industries_interested', []))}",
        "metadata": {
            "category": "goals",
            "tags": ["career", "future", "aspirations", "learning"]
        }
    })
    chunk_id += 1
    
    # Achievements and Metrics
    achievements_metrics = profile_data.get('achievements_metrics', {})
    if achievements_metrics:
        comp_achievements = achievements_metrics.get('competition_achievements', [])
        tech_achievements = achievements_metrics.get('technical_achievements', [])
        personal_metrics = achievements_metrics.get('personal_metrics', [])
        
        all_achievements = []
        if comp_achievements:
            all_achievements.append(f"Competition Achievements: {', '.join(comp_achievements)}")
        if tech_achievements:
            all_achievements.append(f"Technical Achievements: {', '.join(tech_achievements)}")
        if personal_metrics:
            all_achievements.append(f"Personal Metrics: {', '.join(personal_metrics)}")
        
        if all_achievements:
            chunks.append({
                "id": f"chunk_{chunk_id}",
                "title": "Key Achievements and Metrics",
                "type": "achievements",
                "content": ". ".join(all_achievements),
                "metadata": {
                    "category": "achievements",
                    "tags": ["metrics", "accomplishments", "competition", "technical"]
                }
            })
            chunk_id += 1
    
    # Interview Preparation - Weakness Mitigation
    interview_prep = profile_data.get('interview_prep', {})
    weakness_mitigation = interview_prep.get('weakness_mitigation', [])
    if weakness_mitigation:
        for weakness in weakness_mitigation:
            chunks.append({
                "id": f"chunk_{chunk_id}",
                "title": "Weakness Mitigation Strategy",
                "type": "interview_prep",
                "content": f"Weakness: {weakness.get('weakness', 'N/A')}. Mitigation: {weakness.get('mitigation', 'N/A')}",
                "metadata": {
                    "category": "interview",
                    "tags": ["weakness", "improvement", "strategy"]
                }
            })
            chunk_id += 1
    
    # Professional Development
    professional_dev = profile_data.get('professional_development', {})
    if professional_dev:
        dev_content = []
        if professional_dev.get('recent_learning'):
            dev_content.append(f"Recent Learning: {', '.join(professional_dev['recent_learning'])}")
        if professional_dev.get('learning_resources'):
            dev_content.append(f"Learning Resources: {', '.join(professional_dev['learning_resources'])}")
        if professional_dev.get('future_learning'):
            dev_content.append(f"Future Learning: {', '.join(professional_dev['future_learning'])}")
        if professional_dev.get('open_source'):
            dev_content.append(f"Open Source: {', '.join(professional_dev['open_source'])}")
        
        if dev_content:
            chunks.append({
                "id": f"chunk_{chunk_id}",
                "title": "Professional Development",
                "type": "development",
                "content": ". ".join(dev_content),
                "metadata": {
                    "category": "development",
                    "tags": ["learning", "growth", "skills"]
                }
            })
            chunk_id += 1
    
    print(f"✅ Created {len(chunks)} content chunks from profile data")
    return chunks

def embed_and_upload_chunks(index, chunks):
    """Upload content chunks to Upstash Vector with built-in embeddings"""
    print(f"🔄 Uploading {len(chunks)} content chunks to Upstash Vector...")
    
    try:
        # Prepare vectors for upload
        vectors = []
        for chunk in chunks:
            # Create enriched text for better embedding
            enriched_text = f"{chunk['title']}: {chunk['content']}"
            
            # Prepare vector data
            vectors.append((
                chunk['id'],
                enriched_text,  # Upstash will automatically embed this text
                {
                    "title": chunk['title'],
                    "type": chunk['type'],
                    "content": chunk['content'],
                    "category": chunk['metadata']['category'],
                    "tags": chunk['metadata']['tags']
                }
            ))
        
        # Upload vectors in batch
        index.upsert(vectors=vectors)
        print(f"✅ Successfully uploaded {len(vectors)} vectors to Upstash Vector!")
        
        # Verify upload
        info = index.info()
        print(f"📊 Total vectors in database: {getattr(info, 'vector_count', 'Unknown')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error uploading vectors: {str(e)}")
        return False

def main():
    """Main function to process digitaltwin.json and create embeddings"""
    print("🤖 Digital Twin Embedding Script")
    print("=" * 50)
    print("📋 Processing professional profile data...")
    
    # Check if JSON file exists
    if not os.path.exists(JSON_FILE):
        print(f"❌ {JSON_FILE} not found!")
        return
    
    # Load profile data
    try:
        with open(JSON_FILE, "r", encoding="utf-8") as f:
            profile_data = json.load(f)
        print(f"✅ Loaded profile data from {JSON_FILE}")
    except Exception as e:
        print(f"❌ Error loading JSON file: {str(e)}")
        return
    
    # Setup Upstash Vector client
    index = setup_upstash_client()
    if not index:
        return
    
    # Create content chunks
    chunks = create_content_chunks(profile_data)
    
    # Add content_chunks to the original data structure
    profile_data['content_chunks'] = chunks
    
    # Save updated JSON with content_chunks
    try:
        with open(JSON_FILE, "w", encoding="utf-8") as f:
            json.dump(profile_data, f, indent=2, ensure_ascii=False)
        print(f"✅ Updated {JSON_FILE} with content_chunks")
    except Exception as e:
        print(f"❌ Error saving updated JSON: {str(e)}")
        return
    
    # Upload to Upstash Vector
    success = embed_and_upload_chunks(index, chunks)
    
    if success:
        print("🎉 Digital twin embedding completed successfully!")
        print("Your professional profile is now ready for RAG queries.")
        print("\nNext steps:")
        print("1. Test your embeddings with the RAG application")
        print("2. Create the MCP server for VS Code integration")
        print("3. Practice interview scenarios with your AI assistant")
    else:
        print("❌ Embedding process failed. Check your environment variables and try again.")

if __name__ == "__main__":
    main()
