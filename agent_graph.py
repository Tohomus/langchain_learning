import os
from typing import TypedDict,List
from dotenv import load_dotenv
from langgraph.graph import StateGraph,END
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_classic.chains import RetrievalQA

load_dotenv()

embeddings=HuggingFaceEndpointEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2",
    huggingfacehub_api_token=os.getenv("HF_TOKEN")
)

vector_db=Chroma(
    persist_directory="./chroma_db",
    embedding_function=embeddings
)

llm=ChatGroq(model="llama-3.1-8b-instant")

rag_chain=RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_db.as_retriever()
)



class GraphState(TypedDict):
    question:str
    classification:str
    response:str

def classify_input(state: GraphState):
    question=state["question"].lower()
    if any(word in question for word in ["hi","hello","hey","hola"]):
        return{"classification":"greeting"}
    else:
        return{"classification":"search"}
    
def handle_greeting(state: GraphState):
    return{"response":f"Hello! I am your AI assistant. How can I help you with your documents today?"}

def handle_search(state: GraphState):
    print(f"I am searching Vector DB for:{state['question']}")
    result=rag_chain.invoke(state["question"])
    return{"response":result["result"]}

workflow=StateGraph(GraphState)

workflow.add_node("classify",classify_input)
workflow.add_node("greet",handle_greeting)
workflow.add_node("search",handle_search)

workflow.set_entry_point("classify")

workflow.add_conditional_edges(
    "classify",
    lambda x: x["classification"],
    {
        "greeting":"greet",
        "search":"search"
    }
)

workflow.add_edge("greet",END)
workflow.add_edge("search",END)

app=workflow.compile()

print("Testing the Agent Graph")
result=app.invoke({"question":"List out all the topics that is included in the document."})
print(f"Result: {result['response']}")