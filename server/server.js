require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

const templatesFilePath = path.join(__dirname, 'templates.json');

// Helper function to read templates from file
const readTemplates = () => {
  try {
    const data = fs.readFileSync(templatesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading templates file:', error);
    return [];
  }
};

// Helper function to write templates to file
const writeTemplates = (templates) => {
  try {
    fs.writeFileSync(templatesFilePath, JSON.stringify(templates, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing templates file:', error);
  }
};

let templates = readTemplates(); // Load templates on startup

// GET all templates
app.get('/api/templates', (req, res) => {
  const { category } = req.query;
  if (category) {
    const filteredTemplates = templates.filter(t => t.category === category);
    res.json(filteredTemplates);
  } else {
    res.json(templates);
  }
});

// POST a new template
app.post('/api/templates', (req, res) => {
  const { title, category, content } = req.body;
  if (!title || !category || !content) {
    return res.status(400).json({ error: 'Title, category, and content are required' });
  }
  const newTemplate = { id: Date.now().toString(), title, category, content };
  templates.push(newTemplate);
  writeTemplates(templates); // Persist changes
  res.status(201).json(newTemplate);
});

// PUT (update) an existing template
app.put('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  const { title, category, content } = req.body;
  const templateIndex = templates.findIndex(t => t.id === id);

  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }

  if (!title || !category || !content) {
    return res.status(400).json({ error: 'Title, category, and content are required' });
  }

  templates[templateIndex] = { ...templates[templateIndex], title, category, content };
  writeTemplates(templates); // Persist changes
  res.json(templates[templateIndex]);
});

// DELETE a template
app.delete('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = templates.length;
  templates = templates.filter(t => t.id !== id);

  if (templates.length === initialLength) {
    return res.status(404).json({ error: 'Template not found' });
  }

  writeTemplates(templates); // Persist changes
  res.status(204).send(); // No content to send back
});

// POST to duplicate a template
app.post('/api/templates/:id/duplicate', (req, res) => {
  const { id } = req.params;
  const templateToDuplicate = templates.find(t => t.id === id);

  if (!templateToDuplicate) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const newTemplate = {
    ...templateToDuplicate,
    id: Date.now().toString(), // Generate a new unique ID
    title: `${templateToDuplicate.title} (Copy)` // Append "(Copy)" to the title
  };

  templates.push(newTemplate);
  writeTemplates(templates); // Persist changes
  res.status(201).json(newTemplate);
});

app.post('/api/paraphrase', async (req, res) => {
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

    res.json({ paraphrasedContent: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Failed to paraphrase content' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
