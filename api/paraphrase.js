const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that paraphrases text for better copywriting." },
          { role: "user", content: `Paraphrase the following text for better copywriting: "${content}"` }
        ],
      });

      return res.status(200).json({ paraphrasedContent: completion.choices[0].message.content });
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return res.status(500).json({ error: 'Failed to paraphrase content' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
