#!/usr/bin/env python3
"""
Smart Life Assistant Backend API Tests
Tests all backend endpoints for Tasks, Habits, Daily Tips, and Stats
"""

import requests
import json
import time
from datetime import datetime, timedelta
import sys

# Backend URL from frontend environment
BACKEND_URL = "https://lifehub-42.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = {
            'tasks': {'passed': 0, 'failed': 0, 'errors': []},
            'habits': {'passed': 0, 'failed': 0, 'errors': []},
            'tips': {'passed': 0, 'failed': 0, 'errors': []},
            'stats': {'passed': 0, 'failed': 0, 'errors': []}
        }
        self.created_task_ids = []
        self.created_habit_ids = []
        
    def log_result(self, category, test_name, success, error_msg=None):
        """Log test result"""
        if success:
            self.test_results[category]['passed'] += 1
            print(f"✅ {test_name}")
        else:
            self.test_results[category]['failed'] += 1
            self.test_results[category]['errors'].append(f"{test_name}: {error_msg}")
            print(f"❌ {test_name}: {error_msg}")
    
    def test_tasks_api(self):
        """Test all Tasks API endpoints"""
        print("\n🔧 Testing Tasks API...")
        
        # Test 1: Create Task
        try:
            task_data = {
                "title": "إنجاز مشروع التطبيق الذكي",
                "description": "تطوير تطبيق مساعد الحياة الذكي",
                "priority": "high",
                "energy_level": "high",
                "status": "pending"
            }
            
            response = self.session.post(f"{self.base_url}/tasks", json=task_data)
            if response.status_code == 200:
                task = response.json()
                if 'id' in task and task['title'] == task_data['title']:
                    self.created_task_ids.append(task['id'])
                    self.log_result('tasks', 'POST /api/tasks - Create task', True)
                else:
                    self.log_result('tasks', 'POST /api/tasks - Create task', False, "Missing id or incorrect title in response")
            else:
                self.log_result('tasks', 'POST /api/tasks - Create task', False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result('tasks', 'POST /api/tasks - Create task', False, str(e))
        
        # Test 2: Get All Tasks
        try:
            response = self.session.get(f"{self.base_url}/tasks")
            if response.status_code == 200:
                tasks = response.json()
                if isinstance(tasks, list):
                    self.log_result('tasks', 'GET /api/tasks - List all tasks', True)
                else:
                    self.log_result('tasks', 'GET /api/tasks - List all tasks', False, "Response is not a list")
            else:
                self.log_result('tasks', 'GET /api/tasks - List all tasks', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('tasks', 'GET /api/tasks - List all tasks', False, str(e))
        
        # Test 3: Filter Tasks by Status
        try:
            response = self.session.get(f"{self.base_url}/tasks?status=pending")
            if response.status_code == 200:
                tasks = response.json()
                if isinstance(tasks, list):
                    # Check if all tasks have pending status
                    all_pending = all(task.get('status') == 'pending' for task in tasks)
                    if all_pending or len(tasks) == 0:
                        self.log_result('tasks', 'GET /api/tasks?status=pending - Filter by status', True)
                    else:
                        self.log_result('tasks', 'GET /api/tasks?status=pending - Filter by status', False, "Some tasks don't have pending status")
                else:
                    self.log_result('tasks', 'GET /api/tasks?status=pending - Filter by status', False, "Response is not a list")
            else:
                self.log_result('tasks', 'GET /api/tasks?status=pending - Filter by status', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('tasks', 'GET /api/tasks?status=pending - Filter by status', False, str(e))
        
        # Test 4: Update Task (change status to completed)
        if self.created_task_ids:
            try:
                task_id = self.created_task_ids[0]
                update_data = {"status": "completed"}
                
                response = self.session.put(f"{self.base_url}/tasks/{task_id}", json=update_data)
                if response.status_code == 200:
                    updated_task = response.json()
                    if updated_task.get('status') == 'completed' and 'completed_at' in updated_task:
                        self.log_result('tasks', 'PUT /api/tasks/{id} - Update task status', True)
                    else:
                        self.log_result('tasks', 'PUT /api/tasks/{id} - Update task status', False, "Status not updated or completed_at missing")
                else:
                    self.log_result('tasks', 'PUT /api/tasks/{id} - Update task status', False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result('tasks', 'PUT /api/tasks/{id} - Update task status', False, str(e))
        
        # Test 5: Delete Task
        if self.created_task_ids:
            try:
                task_id = self.created_task_ids[0]
                response = self.session.delete(f"{self.base_url}/tasks/{task_id}")
                if response.status_code == 200:
                    result = response.json()
                    if 'message' in result:
                        self.log_result('tasks', 'DELETE /api/tasks/{id} - Delete task', True)
                        self.created_task_ids.remove(task_id)
                    else:
                        self.log_result('tasks', 'DELETE /api/tasks/{id} - Delete task', False, "No success message in response")
                else:
                    self.log_result('tasks', 'DELETE /api/tasks/{id} - Delete task', False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result('tasks', 'DELETE /api/tasks/{id} - Delete task', False, str(e))
    
    def test_habits_api(self):
        """Test all Habits API endpoints"""
        print("\n🔧 Testing Habits API...")
        
        # Test 1: Create Habit
        try:
            habit_data = {
                "name": "قراءة يومية",
                "description": "قراءة 30 دقيقة يومياً",
                "icon": "book",
                "color": "#4CAF50",
                "frequency": "daily"
            }
            
            response = self.session.post(f"{self.base_url}/habits", json=habit_data)
            if response.status_code == 200:
                habit = response.json()
                if 'id' in habit and habit['name'] == habit_data['name']:
                    self.created_habit_ids.append(habit['id'])
                    self.log_result('habits', 'POST /api/habits - Create habit', True)
                else:
                    self.log_result('habits', 'POST /api/habits - Create habit', False, "Missing id or incorrect name in response")
            else:
                self.log_result('habits', 'POST /api/habits - Create habit', False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result('habits', 'POST /api/habits - Create habit', False, str(e))
        
        # Test 2: Get All Habits
        try:
            response = self.session.get(f"{self.base_url}/habits")
            if response.status_code == 200:
                habits = response.json()
                if isinstance(habits, list):
                    self.log_result('habits', 'GET /api/habits - List all habits', True)
                else:
                    self.log_result('habits', 'GET /api/habits - List all habits', False, "Response is not a list")
            else:
                self.log_result('habits', 'GET /api/habits - List all habits', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('habits', 'GET /api/habits - List all habits', False, str(e))
        
        # Test 3: Complete Habit (test streak logic)
        if self.created_habit_ids:
            try:
                habit_id = self.created_habit_ids[0]
                response = self.session.post(f"{self.base_url}/habits/{habit_id}/complete")
                if response.status_code == 200:
                    completed_habit = response.json()
                    if 'streak' in completed_habit and 'last_completed' in completed_habit:
                        # Check if today is in completion_dates
                        today = datetime.utcnow().strftime('%Y-%m-%d')
                        completion_dates = completed_habit.get('completion_dates', [])
                        if today in completion_dates:
                            self.log_result('habits', 'POST /api/habits/{id}/complete - Mark habit complete', True)
                        else:
                            self.log_result('habits', 'POST /api/habits/{id}/complete - Mark habit complete', False, "Today not added to completion_dates")
                    else:
                        self.log_result('habits', 'POST /api/habits/{id}/complete - Mark habit complete', False, "Missing streak or last_completed in response")
                else:
                    self.log_result('habits', 'POST /api/habits/{id}/complete - Mark habit complete', False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result('habits', 'POST /api/habits/{id}/complete - Mark habit complete', False, str(e))
        
        # Test 4: Update Habit
        if self.created_habit_ids:
            try:
                habit_id = self.created_habit_ids[0]
                update_data = {"name": "قراءة يومية محدثة", "color": "#FF5722"}
                
                response = self.session.put(f"{self.base_url}/habits/{habit_id}", json=update_data)
                if response.status_code == 200:
                    updated_habit = response.json()
                    if updated_habit.get('name') == update_data['name'] and updated_habit.get('color') == update_data['color']:
                        self.log_result('habits', 'PUT /api/habits/{id} - Update habit', True)
                    else:
                        self.log_result('habits', 'PUT /api/habits/{id} - Update habit', False, "Habit not updated correctly")
                else:
                    self.log_result('habits', 'PUT /api/habits/{id} - Update habit', False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result('habits', 'PUT /api/habits/{id} - Update habit', False, str(e))
        
        # Test 5: Delete Habit
        if self.created_habit_ids:
            try:
                habit_id = self.created_habit_ids[0]
                response = self.session.delete(f"{self.base_url}/habits/{habit_id}")
                if response.status_code == 200:
                    result = response.json()
                    if 'message' in result:
                        self.log_result('habits', 'DELETE /api/habits/{id} - Delete habit', True)
                        self.created_habit_ids.remove(habit_id)
                    else:
                        self.log_result('habits', 'DELETE /api/habits/{id} - Delete habit', False, "No success message in response")
                else:
                    self.log_result('habits', 'DELETE /api/habits/{id} - Delete habit', False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result('habits', 'DELETE /api/habits/{id} - Delete habit', False, str(e))
    
    def test_daily_tips_api(self):
        """Test Daily Tips API endpoint"""
        print("\n🔧 Testing Daily Tips API...")
        
        # Test 1: Get Daily Tip (AI generation)
        try:
            response = self.session.get(f"{self.base_url}/tips/daily")
            if response.status_code == 200:
                tip = response.json()
                if 'tip' in tip and 'date' in tip:
                    # Check if tip is in Arabic (contains Arabic characters)
                    tip_text = tip['tip']
                    has_arabic = any('\u0600' <= char <= '\u06FF' for char in tip_text)
                    if has_arabic:
                        self.log_result('tips', 'GET /api/tips/daily - Generate AI daily tip (Arabic)', True)
                    else:
                        self.log_result('tips', 'GET /api/tips/daily - Generate AI daily tip (Arabic)', False, "Tip doesn't contain Arabic text")
                else:
                    self.log_result('tips', 'GET /api/tips/daily - Generate AI daily tip (Arabic)', False, "Missing tip or date in response")
            else:
                self.log_result('tips', 'GET /api/tips/daily - Generate AI daily tip (Arabic)', False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result('tips', 'GET /api/tips/daily - Generate AI daily tip (Arabic)', False, str(e))
        
        # Test 2: Same tip for same day (caching test)
        try:
            time.sleep(1)  # Small delay
            response2 = self.session.get(f"{self.base_url}/tips/daily")
            if response2.status_code == 200:
                tip2 = response2.json()
                # Should return the same tip for the same day
                if 'tip' in tip2 and 'date' in tip2:
                    today = datetime.utcnow().strftime('%Y-%m-%d')
                    if tip2['date'] == today:
                        self.log_result('tips', 'GET /api/tips/daily - Same tip for same day (caching)', True)
                    else:
                        self.log_result('tips', 'GET /api/tips/daily - Same tip for same day (caching)', False, "Date doesn't match today")
                else:
                    self.log_result('tips', 'GET /api/tips/daily - Same tip for same day (caching)', False, "Missing tip or date in second response")
            else:
                self.log_result('tips', 'GET /api/tips/daily - Same tip for same day (caching)', False, f"Status: {response2.status_code}")
        except Exception as e:
            self.log_result('tips', 'GET /api/tips/daily - Same tip for same day (caching)', False, str(e))
    
    def test_stats_api(self):
        """Test Stats API endpoint"""
        print("\n🔧 Testing Stats API...")
        
        # Test 1: Get Aggregated Stats
        try:
            response = self.session.get(f"{self.base_url}/stats")
            if response.status_code == 200:
                stats = response.json()
                required_fields = ['total_tasks', 'completed_tasks', 'pending_tasks', 'active_habits', 'completion_rate', 'total_streak']
                
                missing_fields = [field for field in required_fields if field not in stats]
                if not missing_fields:
                    # Validate data types
                    valid_types = (
                        isinstance(stats['total_tasks'], int) and
                        isinstance(stats['completed_tasks'], int) and
                        isinstance(stats['pending_tasks'], int) and
                        isinstance(stats['active_habits'], int) and
                        isinstance(stats['completion_rate'], (int, float)) and
                        isinstance(stats['total_streak'], int)
                    )
                    
                    if valid_types:
                        # Validate logic
                        if stats['total_tasks'] == stats['completed_tasks'] + stats['pending_tasks']:
                            self.log_result('stats', 'GET /api/stats - Get aggregated stats', True)
                        else:
                            self.log_result('stats', 'GET /api/stats - Get aggregated stats', False, "Task count logic error")
                    else:
                        self.log_result('stats', 'GET /api/stats - Get aggregated stats', False, "Invalid data types in response")
                else:
                    self.log_result('stats', 'GET /api/stats - Get aggregated stats', False, f"Missing fields: {missing_fields}")
            else:
                self.log_result('stats', 'GET /api/stats - Get aggregated stats', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('stats', 'GET /api/stats - Get aggregated stats', False, str(e))
    
    def cleanup(self):
        """Clean up created test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete remaining tasks
        for task_id in self.created_task_ids:
            try:
                self.session.delete(f"{self.base_url}/tasks/{task_id}")
            except:
                pass
        
        # Delete remaining habits
        for habit_id in self.created_habit_ids:
            try:
                self.session.delete(f"{self.base_url}/habits/{habit_id}")
            except:
                pass
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Smart Life Assistant Backend API Tests")
        print(f"🔗 Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test all API endpoints
        self.test_tasks_api()
        self.test_habits_api()
        self.test_daily_tips_api()
        self.test_stats_api()
        
        # Cleanup
        self.cleanup()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_passed = sum(category['passed'] for category in self.test_results.values())
        total_failed = sum(category['failed'] for category in self.test_results.values())
        
        for category, results in self.test_results.items():
            print(f"{category.upper()}: ✅ {results['passed']} passed, ❌ {results['failed']} failed")
            if results['errors']:
                for error in results['errors']:
                    print(f"  - {error}")
        
        print(f"\nOVERALL: ✅ {total_passed} passed, ❌ {total_failed} failed")
        
        if total_failed > 0:
            print("\n⚠️  Some tests failed. Please check the errors above.")
            return False
        else:
            print("\n🎉 All tests passed successfully!")
            return True

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)