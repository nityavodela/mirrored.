// We use node-fetch to talk to Hugging Face
const fetch = require('node-fetch');

exports.handler = async (event) => {
    // Only allow POST requests (messages being sent)
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { message } = JSON.parse(event.body);

        // SECURE: This pulls the token from Netlify's settings, NOT from the code
        const HF_TOKEN = process.env.HF_TOKEN; 

        if (!HF_TOKEN) {
            return { 
                statusCode: 500, 
                body: JSON.stringify({ error: "Missing API Token in Netlify settings." }) 
            };
        }

        // The Hugging Face API URL for Mistral 7B
        const MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

        const response = await fetch(MODEL_URL, {
            headers: { 
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `<s>[INST] You are an eerie entity living in a mirror dimension. You refer to the user as 'The Static One'. Speak in one or two short, cryptic sentences. User: ${message} [/INST]`,
                parameters: { 
                    max_new_tokens: 100, 
                    return_full_text: false,
                    wait_for_model: true // Prevents errors if the AI is "sleeping"
                }
            }),
        });

        const data = await response.json();

        // Return the AI response back to your website
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error("Function Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Dimensional Collapse: " + error.message }) 
        };
    }
};