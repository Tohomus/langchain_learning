from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
import os

embeddings=SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

CHROMA_PATH="chroma_db"

def process_pdf_to_vector_store(file_path:str):
    loader=PyPDFLoader(file_path)
    docs=loader.load()
    text_splitter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=100)
    chunks=text_splitter.split_documents(docs)

    vector_db=Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PATH
    )

    return vector_db.as_retriever()

def get_retriever():
    if os.path.exists(CHROMA_PATH):
        vector_db=Chroma(persist_directory=CHROMA_PATH,embedding_function=embeddings)
        return vector_db.as_retriever()
    return None
