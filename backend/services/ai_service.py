import requests
import json
from config import GEMINI_API_KEY, GROQ_API_KEY

class AIService:
    def __init__(self):
        self.gemini_key = GEMINI_API_KEY
        self.groq_key = GROQ_API_KEY

    def call_groq_api(self, prompt: str):
        if not self.groq_key:
            if self.gemini_key:
                return self.call_gemini_api(prompt)
            raise ValueError("GROQ_API_KEY is not set.")
        
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }
        
        try:
            response = requests.post(url, headers=headers, json=data)
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content']
            else:
                return f"Groq API Error {response.status_code}: {response.text}"
        except Exception as e:
            return f"Connection Error: {str(e)}"

    def call_gemini_api(self, prompt: str):
        if not self.gemini_key:
            return "Error: No API keys configured."
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        headers = {"Content-Type": "application/json"}
        data = {"contents": [{"parts": [{"text": prompt}]}]}
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            result = response.json()
            try:
                return result['candidates'][0]['content']['parts'][0]['text']
            except (KeyError, IndexError):
                return "Error: Could not parse response from Gemini API."
        else:
            return f"Gemini API Error {response.status_code}: {response.text}"

    def generate_interview_question(self, topic: str, difficulty: str):
        prompt = f"Generate a {difficulty} level mock interview question about {topic}. Just provide the question text itself, completely plain, no formatting."
        return self.call_groq_api(prompt)

    def evaluate_interview_answer(self, question: str, answer: str):
        prompt = f"""
        Evaluate the following answer to the interview question.
        Question: {question}
        Answer: {answer}
        
        Provide feedback and a score out of 10. You must respond in valid JSON format with exactly two keys: 'feedback' (string) and 'score' (number). Do not include any other markdown formatting outside the JSON object.
        """
        return self.call_groq_api(prompt)

    def explain_code(self, code: str):
        prompt = f"Explain the following code snippet in extremely simple, easy-to-understand bullet points. Aim for maximum clarity.\n\n```\n{code}\n```"
        return self.call_groq_api(prompt)

    def analyze_resume(self, resume_text: str):
        prompt = f"""
        Analyze the following resume text. Provide:
        1. A summary of strengths.
        2. Areas for improvement.
        3. A likely 'ATS score' (out of 100).
        4. 5 tailored interview questions based on this experience.
        
        Format the response in clear, professional markdown.
        
        Resume Text:
        {resume_text}
        """
        return self.call_groq_api(prompt)
