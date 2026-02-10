import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        console.log('Testing API Key with:', apiKey ? 'Key found' : 'No key found');
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        console.log('Available Models:');
        response.data.models.forEach(model => {
            console.log(`- ${model.name}`);
        });
    } catch (error) {
        console.error('Error listing models:', error.response ? error.response.data : error.message);
    }
}

listModels();
