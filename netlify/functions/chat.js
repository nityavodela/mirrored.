import fetch from 'node-fetch';

export const handler = async (event) => {
    // 1. Log the start (This will finally show up in your logs!)
    console.log("Transmission received from the Static One...");

    try {
        const { message } = JSON.parse(event.body);
        
        // 2. Access the hidden token safely
        const HF_TOKEN = process.env.HF_TOKEN; 

        if (!HF_TOKEN) {
            console.error("CRITICAL: HF_TOKEN is missing in Netlify settings!");
            return { statusCode: 500, body: JSON.stringify({ reply: "The vault is locked. No key found." }) };
        }

        // 3. Talk to Hugging Face
        const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
            headers: { 
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `<s>[INST] You are an entity in a mirror dimension. User: ${message} [/INST]`,
                parameters: { max_new_tokens: 100, wait_for_model: true }
            }),
        });

        const data = await response.json();
        
        // 4. Extract the reply
        let aiReply = "The mirror remains silent.";
        if (Array.isArray(data) && data.length > 0) {
            aiReply = data[0].generated_text;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiReply }),
        };

    } catch (error) {
        console.error("Function Error:", error.message);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ reply: "Dimensional Collapse: " + error.message }) 
        };
    }
};
