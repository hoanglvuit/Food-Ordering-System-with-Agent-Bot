import os
from langchain_google_genai import ChatGoogleGenerativeAI
from schema import UserIntent

# load .env
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.7,
)

SERVER = os.getenv("POSTGRES_SERVER")
USER = os.getenv("POSTGRES_USER")
PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB = os.getenv("POSTGRES_DB")
PORT = os.getenv("POSTGRES_PORT")

DATABASE_URL = f"postgresql://{USER}:{PASSWORD}@{SERVER}:{PORT}/{DB}"

structured_llm = llm.with_structured_output(UserIntent)
