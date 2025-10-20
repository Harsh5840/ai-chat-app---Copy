import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testGroq() {
  try {
    console.log('Testing GROQ API...');
    console.log('API Key:', process.env.GROQ_API_KEY ? 'Found' : 'NOT FOUND');
    
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('SUCCESS!');
    console.log('Response:', response.data.choices[0].message.content);
  } catch (error) {
    console.error('ERROR:', error.response?.data || error.message);
  }
}

testGroq();
