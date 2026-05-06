from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
from vector_store import get_retriever
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os

load_dotenv()


os.environ["GROQ_API_KEY"]=os.getenv("GROQ_API_KEY")

llm=ChatGroq(model="llama-3.1-8b-instant",temperature=0)

class AgentState(TypedDict):
    question: str
    response: str

def call_model(state: AgentState):
    question=state["question"]
    retriever=get_retriever()

    context_text=""
    if retriever:
        context_docs=retriever.invoke(question)
        context_text="\n".join([doc.page_content for doc in context_docs])

        prompt=ChatPromptTemplate.from_messages([
            ("system", """You are a professional RAG Assistant. 
            Answer the question based ONLY on the provided context from the PDF.
            If the answer is not in the context, politely say you don't know.
            
            Context:
            {context}"""),
            ("user", "{question}")
        ])

        chain=prompt | llm
        result=chain.invoke({"context":context_text,"question":question})
        response=result.content
        
    else:
        response="I haven't processed any PDFs yet.Please upload one!"

    return{"response":response}

workflow = StateGraph(AgentState)
workflow.add_node("agent", call_model)
workflow.set_entry_point("agent")
workflow.add_edge("agent", END)

app = workflow.compile()