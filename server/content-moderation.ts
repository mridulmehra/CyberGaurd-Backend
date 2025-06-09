import axios from 'axios';
import { ToxicityResult } from '@shared/schema';

export async function checkMessageToxicity(message: string): Promise<ToxicityResult> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('Content moderation API key not found in environment variables');
      return { isToxic: false }; // Default to non-toxic if API key is missing
    }

    // Make sure there are no 'key=' prefixes in the apiKey itself
    const cleanApiKey = apiKey.replace('GOOGLE_API_KEY=', '').replace('key=', '');
    console.log('Using content moderation API');
    
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanApiKey}`;
    
    const payload = {
      contents: [
        {
          parts: [
            { text: `Analyze the following message and determine if it contains any toxic, offensive, harmful, or inappropriate content. 
            Respond with a JSON object with two properties:
            1. "isToxic": true if the message contains any toxic content, false otherwise
            2. "detoxifiedText": only if isToxic is true, provide a rewritten version that expresses the same sentiment but in a respectful, non-offensive way
            
            Message to analyze: "${message}"` }
          ]
        }
      ]
    };

    const response = await axios.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extract the response text
    const responseText = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response text - find anything that looks like a JSON object
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const resultJson = JSON.parse(jsonMatch[0]);
        return {
          isToxic: resultJson.isToxic,
          detoxifiedText: resultJson.detoxifiedText
        };
      } catch (error) {
        console.error('Error parsing content moderation API JSON response:', error);
        return { isToxic: false };
      }
    }
    
    // Fallback analysis if JSON parsing fails
    const lowerResponseText = responseText.toLowerCase();
    const isToxic = lowerResponseText.includes('toxic') && !lowerResponseText.includes('not toxic');
    
    return {
      isToxic,
      detoxifiedText: isToxic ? `I'd like to express my thoughts more respectfully.` : undefined
    };
    
  } catch (error) {
    console.error('Error calling content moderation API:', error);
    return { isToxic: false }; // Default to non-toxic in case of errors
  }
}