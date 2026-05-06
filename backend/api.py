from fastapi import FastAPI,UploadFile,File,Form
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from agent_graph import app as agent_app
from vector_store import process_pdf_to_vector_store


api=FastAPI()

api.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR="data"

@api.post("/upload")
async def upload_pdf(file: UploadFile=File(...)):
    os.makedirs(UPLOAD_DIR,exist_ok=True)
    file_path=os.path.join(UPLOAD_DIR,file.filename)

    with open(file_path,"wb") as buffer:
        shutil.copyfileobj(file.file,buffer)

    process_pdf_to_vector_store(file_path)

    return {"message": f"Successfully uploaded {file.filename}", "filename": file.filename}

@api.post("/chat")
async def chat_with_agent(question: str=Form(...)):
    result=agent_app.invoke({"question":question})
    return {"response":result["response"]}

if __name__=="__main__":
    import uvicorn
    uvicorn.run(api,host="0.0.0.0",port=8000)