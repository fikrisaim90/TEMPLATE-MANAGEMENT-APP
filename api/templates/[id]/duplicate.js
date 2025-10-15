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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { id } = req.query;
    const templates = readTemplates();
    const templateToDuplicate = templates.find(t => t.id === id);

    if (!templateToDuplicate) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const newTemplate = {
      ...templateToDuplicate,
      id: Date.now().toString(),
      title: `${templateToDuplicate.title} (Copy)`
    };

    templates.push(newTemplate);
    writeTemplates(templates);

    return res.status(201).json(newTemplate);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
