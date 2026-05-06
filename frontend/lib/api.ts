const API_BASE_URL="http://localhost:8000";

export const apiService={
    async uploadFile(file: File){
        const formData=new FormData();
        formData.append("file", file);

        const response=await fetch(`${API_BASE_URL}/upload`,{
            method:"POST",
            body:formData,
        });
        return response.json();
    },

    async sendMessage(question: string){
        const formData =new FormData();
        formData.append("question",question);

        const response=await fetch(`${API_BASE_URL}/chat`,{
            method:"POST",
            body:formData,
        });
        return response.json();
    }
};