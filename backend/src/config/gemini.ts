import { GoogleGenAI } from "@google/genai";
import config from '.';



    const ai = new GoogleGenAI({
        apiKey: config.geminiApiKey
    });
export default ai;
    // const response = await ai.models.embedContent({
    //     model: 'gemini-embedding-001',
    //     contents: 'What is the meaning of life?',
    // });



