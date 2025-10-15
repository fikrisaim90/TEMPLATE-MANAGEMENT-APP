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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  let templates = readTemplates();

  if (req.method === 'GET') {
    // GET single template by id
    const template = templates.find(t => t.id === id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    return res.status(200).json(template);
  }

  if (req.method === 'PUT') {
    // PUT (update) an existing template
    const { title, category, content } = req.body;
    const templateIndex = templates.findIndex(t => t.id === id);

    if (templateIndex === -1) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!title || !category || !content) {
      return res.status(400).json({ error: 'Title, category, and content are required' });
    }

    templates[templateIndex] = { ...templates[templateIndex], title, category, content };
    writeTemplates(templates);

    return res.status(200).json(templates[templateIndex]);
  }

  if (req.method === 'DELETE') {
    // DELETE a template
    const initialLength = templates.length;
    templates = templates.filter(t => t.id !== id);

    if (templates.length === initialLength) {
      return res.status(404).json({ error: 'Template not found' });
    }

    writeTemplates(templates);
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
