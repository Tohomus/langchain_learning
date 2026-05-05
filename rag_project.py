import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate

load_dotenv()

loader=DirectoryLoader(
    'data/',glob="./*.pdf",loader_cls=PyPDFLoader
)
documents=loader.load()

text_splitter=RecursiveCharacterTextSplitter(chunk_size=500,chunk_overlap=50)
chunks=text_splitter.split_documents(documents)

embeddings=HuggingFaceEndpointEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2",
    huggingfacehub_api_token=os.getenv("HF_TOKEN")
)

vector_db=Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

llm=ChatGroq(model="llama-3.1-8b-instant")

template="""Use the following pieces of context to answer the question at the end.
If you don't know the answer,just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer concise.

{context}

Question:{question}

Helpful Answer:"""

custom_rag_prompt=PromptTemplate.from_template(template)

rag_chain=RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_db.as_retriever(),
    chain_type_kwargs={"prompt": custom_rag_prompt}
)

query ="list all the topics that is included in this pdf document"
response=rag_chain.invoke(query)

print("The Rag response is :- ")
print(response["result"])