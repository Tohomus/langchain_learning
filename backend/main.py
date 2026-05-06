import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

llm=ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0
)

embeddings=HuggingFaceEndpointEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2",
    huggingfacehub_api_token=os.getenv("HF_TOKEN")
)

prompt=ChatPromptTemplate.from_template("Explain {concept} in one sentence for a software developer.")
chain=prompt | llm

print("Testing LLM Chat:- ")
response=chain.invoke({"concept": "LangChain"})
print(f"AI Reponse: {response.content}")

print("Testing Embeddings:- ")
sample_text="Machine Learning is fun. "
vector=embeddings.embed_query(sample_text)
print(f"Text: '{sample_text}'")
print(f"Vector Preview (First 5 numbers): {vector[:5]}")
print(f"Total Vector Dimensions: {len(vector)}")