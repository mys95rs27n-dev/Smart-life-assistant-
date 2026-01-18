from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Get LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Helper function to convert ObjectId to string
def serialize_doc(doc):
    if doc and '_id' in doc:
        doc['id'] = str(doc['_id'])
        del doc['_id']
    return doc

# Models
class Task(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: str = "medium"  # low, medium, high
    energy_level: str = "medium"  # low, medium, high
    status: str = "pending"  # pending, in_progress, completed
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    energy_level: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None

class Habit(BaseModel):
    name: str
    description: Optional[str] = ""
    icon: str = "star"
    color: str = "#4CAF50"
    frequency: str = "daily"  # daily, weekly
    streak: int = 0
    last_completed: Optional[datetime] = None
    completion_dates: List[str] = []  # List of dates in YYYY-MM-DD format
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    frequency: Optional[str] = None

class DailyTip(BaseModel):
    tip: str
    date: str
    category: str = "general"  # general, motivation, productivity
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserStats(BaseModel):
    total_tasks: int = 0
    completed_tasks: int = 0
    active_habits: int = 0
    current_energy: str = "medium"

# Task Endpoints
@api_router.get("/tasks", response_model=List[dict])
async def get_tasks(status: Optional[str] = None):
    query = {}
    if status:
        query['status'] = status
    tasks = await db.tasks.find(query).sort('created_at', -1).to_list(1000)
    return [serialize_doc(task) for task in tasks]

@api_router.post("/tasks", response_model=dict)
async def create_task(task: Task):
    task_dict = task.dict()
    result = await db.tasks.insert_one(task_dict)
    task_dict['id'] = str(result.inserted_id)
    return serialize_doc(task_dict)

@api_router.put("/tasks/{task_id}", response_model=dict)
async def update_task(task_id: str, task_update: TaskUpdate):
    update_data = {k: v for k, v in task_update.dict().items() if v is not None}
    
    # If status changed to completed, set completed_at
    if update_data.get('status') == 'completed':
        update_data['completed_at'] = datetime.utcnow()
    
    result = await db.tasks.update_one(
        {'_id': ObjectId(task_id)},
        {'$set': update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    updated_task = await db.tasks.find_one({'_id': ObjectId(task_id)})
    return serialize_doc(updated_task)

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    result = await db.tasks.delete_one({'_id': ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

# Habit Endpoints
@api_router.get("/habits", response_model=List[dict])
async def get_habits():
    habits = await db.habits.find().sort('created_at', -1).to_list(1000)
    return [serialize_doc(habit) for habit in habits]

@api_router.post("/habits", response_model=dict)
async def create_habit(habit: Habit):
    habit_dict = habit.dict()
    result = await db.habits.insert_one(habit_dict)
    habit_dict['id'] = str(result.inserted_id)
    return serialize_doc(habit_dict)

@api_router.put("/habits/{habit_id}", response_model=dict)
async def update_habit(habit_id: str, habit_update: HabitUpdate):
    update_data = {k: v for k, v in habit_update.dict().items() if v is not None}
    
    result = await db.habits.update_one(
        {'_id': ObjectId(habit_id)},
        {'$set': update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    updated_habit = await db.habits.find_one({'_id': ObjectId(habit_id)})
    return serialize_doc(updated_habit)

@api_router.delete("/habits/{habit_id}")
async def delete_habit(habit_id: str):
    result = await db.habits.delete_one({'_id': ObjectId(habit_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Habit not found")
    return {"message": "Habit deleted successfully"}

@api_router.post("/habits/{habit_id}/complete", response_model=dict)
async def complete_habit(habit_id: str):
    today = datetime.utcnow().strftime('%Y-%m-%d')
    
    habit = await db.habits.find_one({'_id': ObjectId(habit_id)})
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    completion_dates = habit.get('completion_dates', [])
    
    # Check if already completed today
    if today in completion_dates:
        return serialize_doc(habit)
    
    # Add today to completion dates
    completion_dates.append(today)
    
    # Calculate streak
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%d')
    current_streak = habit.get('streak', 0)
    
    if yesterday in completion_dates or current_streak == 0:
        current_streak += 1
    else:
        current_streak = 1
    
    # Update habit
    await db.habits.update_one(
        {'_id': ObjectId(habit_id)},
        {'$set': {
            'completion_dates': completion_dates,
            'streak': current_streak,
            'last_completed': datetime.utcnow()
        }}
    )
    
    updated_habit = await db.habits.find_one({'_id': ObjectId(habit_id)})
    return serialize_doc(updated_habit)

# Daily Tips Endpoint
@api_router.get("/tips/daily", response_model=dict)
async def get_daily_tip():
    today = datetime.utcnow().strftime('%Y-%m-%d')
    
    # Check if we already have a tip for today
    existing_tip = await db.daily_tips.find_one({'date': today})
    if existing_tip:
        return serialize_doc(existing_tip)
    
    try:
        # Get user's tasks and habits for context
        pending_tasks = await db.tasks.find({'status': {'$ne': 'completed'}}).to_list(10)
        habits = await db.habits.find().to_list(10)
        
        # Build context for AI
        context = f"مساعد الحياة الذكي - توليد نصيحة يومية\n\n"
        context += f"المستخدم لديه {len(pending_tasks)} مهام قيد التنفيذ و {len(habits)} عادات يتتبعها.\n"
        
        if pending_tasks:
            context += "\nبعض المهام:\n"
            for task in pending_tasks[:3]:
                context += f"- {task.get('title', '')} (أولوية: {task.get('priority', 'متوسطة')})\n"
        
        if habits:
            context += "\nالعادات:\n"
            for habit in habits[:3]:
                context += f"- {habit.get('name', '')} (سلسلة: {habit.get('streak', 0)} يوم)\n"
        
        # Generate tip using AI
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"daily-tip-{today}",
            system_message="أنت مساعد ذكي يقدم نصائح يومية تحفيزية ومفيدة باللغة العربية. النصائح يجب أن تكون قصيرة (2-3 جمل)، إيجابية، وعملية."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(
            text=f"{context}\n\nقدم نصيحة يومية تحفيزية قصيرة ومفيدة للمستخدم لمساعدته في تحقيق أهدافه."
        )
        
        tip_text = await chat.send_message(user_message)
        
        # Save tip to database
        tip_dict = {
            'tip': tip_text,
            'date': today,
            'category': 'general',
            'created_at': datetime.utcnow()
        }
        result = await db.daily_tips.insert_one(tip_dict)
        tip_dict['id'] = str(result.inserted_id)
        
        return serialize_doc(tip_dict)
    
    except Exception as e:
        logger.error(f"Error generating daily tip: {e}")
        # Return a default tip if AI fails
        default_tip = {
            'tip': 'ابدأ يومك بتحديد أهم ثلاث مهام وركز عليها. النجاح يبدأ بخطوة صغيرة! 🌟',
            'date': today,
            'category': 'general',
            'created_at': datetime.utcnow()
        }
        result = await db.daily_tips.insert_one(default_tip)
        default_tip['id'] = str(result.inserted_id)
        return serialize_doc(default_tip)

# Stats Endpoint
@api_router.get("/stats", response_model=dict)
async def get_stats():
    total_tasks = await db.tasks.count_documents({})
    completed_tasks = await db.tasks.count_documents({'status': 'completed'})
    active_habits = await db.habits.count_documents({})
    
    # Calculate completion rate
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Get habits with streaks
    habits = await db.habits.find().to_list(1000)
    total_streak = sum(habit.get('streak', 0) for habit in habits)
    
    return {
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': total_tasks - completed_tasks,
        'active_habits': active_habits,
        'completion_rate': round(completion_rate, 1),
        'total_streak': total_streak
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
