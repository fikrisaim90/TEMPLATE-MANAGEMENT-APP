const fs = require('fs');
const path = require('path');

const templatesFilePath = path.join(process.cwd(), 'api', 'templates.json');

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

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // GET all templates
    const templates = readTemplates();
    const { category } = req.query;

    if (category) {
      const filteredTemplates = templates.filter(t => t.category === category);
      return res.status(200).json(filteredTemplates);
    }

    return res.status(200).json(templates);
  }

  if (req.method === 'POST') {
    // POST a new template
    const { title, category, content } = req.body;

    if (!title || !category || !content) {
      return res.status(400).json({ error: 'Title, category, and content are required' });
    }

    const templates = readTemplates();
    const newTemplate = { id: Date.now().toString(), title, category, content };
    templates.push(newTemplate);
    writeTemplates(templates);

    return res.status(201).json(newTemplate);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
