import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.ai_service import AIService
from config import GROQ_API_KEY

def test_ai_service():
    ai = AIService()
    print(f"Testing Groq integration...")
    if not GROQ_API_KEY:
        print("FAIL: GROQ_API_KEY is not set in config.")
        return

    print("1. Testing Question Generation...")
    try:
        question = ai.generate_interview_question("Python", "Mid-level")
        print(f"Response: {question[:100]}...")
        if "Groq API Error" in question or "Connection Error" in question:
            print("FAIL: Error in question generation.")
        else:
            print("SUCCESS: Question generated.")
    except Exception as e:
        print(f"FAIL: Exception occurred: {str(e)}")

    print("\n2. Testing Code Explanation...")
    code = "def hello(): print('world')"
    try:
        explanation = ai.explain_code(code)
        print(f"Response: {explanation[:100]}...")
        if "Groq API Error" in explanation or "Connection Error" in explanation:
            print("FAIL: Error in code explanation.")
        else:
            print("SUCCESS: Code explained.")
    except Exception as e:
        print(f"FAIL: Exception occurred: {str(e)}")

if __name__ == "__main__":
    test_ai_service()
