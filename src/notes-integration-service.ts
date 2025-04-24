// notes-integration-service.ts
import express from 'express';
import { exec } from 'child_process';
import { z } from 'zod';

// Express server for local testing
const app = express();
const router = express.Router();
app.use(express.json());
app.use(router);
const PORT = process.env.PORT || 3000;

// Schema definitions
const NoteRequestSchema = z.object({
  action: z.enum(['create', 'update', 'delete', 'search']),
  title: z.string().min(1),
  content: z.array(z.string()).optional(),
  folder: z.string().optional(),
});

export type NoteRequest = z.infer<typeof NoteRequestSchema>;

const RequestBodySchema = z.object({
  text: z.string().min(1),
});

/**
 * Parses natural language input into structured note commands
 */
export function parseNaturalLanguage(text: string): NoteRequest | null {
  const lowerText = text.toLowerCase();
  
  // Handle long text content as note creation
  if (text.length > 100 && !text.includes('"') && !text.includes("'")) {
    const firstLine = text.split('\n')[0].trim();
    const title = firstLine.split(' ').slice(0, 5).join(' ');
    
    try {
      return NoteRequestSchema.parse({
        action: 'create',
        title: title,
        content: [text]
      });
    } catch (e) {
      // Continue to other patterns
    }
  }
  
  // Handle trip planning specifically
  if (lowerText.includes('trip') || lowerText.includes('travel') || lowerText.includes('vacation')) {
    const locationMatch = 
      text.match(/(?:trip|travel|vacation)(?:\s+(?:to|for|in))?\s+([A-Za-z\s,]+)/) || 
      text.match(/([A-Za-z\s,]+)(?:\s+(?:trip|travel|vacation))/);
    
    if (locationMatch) {
      const location = locationMatch[1].trim();
      const title = `Trip plan: ${location}`;
      
      try {
        return NoteRequestSchema.parse({
          action: 'create',
          title,
          content: [text]
        });
      } catch (e) {
        // Continue to other patterns
      }
    }
  }
  
  // Handle note creation commands
  const createPatterns = [
    /create\s+(?:a\s+)?note\s+(?:titled|called|named)\s+['"](.+?)['"](?:\s+with\s+(?:items|content|text)(?:\s*:|:|\s+of)?)?(?:\s+(.+))?/i,
    /(?:make|add)\s+(?:a\s+)?(?:new\s+)?note\s+(?:titled|called|named)\s+['"](.+?)['"](?:\s+with\s+(?:items|content|text)(?:\s*:|:|\s+of)?)?(?:\s+(.+))?/i,
    /(?:take|write)\s+(?:a\s+)?note\s+(?:titled|called|named)\s+['"](.+?)['"](?:\s+with\s+(?:items|content|text)(?:\s*:|:|\s+of)?)?(?:\s+(.+))?/i
  ];

  for (const pattern of createPatterns) {
    const match = text.match(pattern);
    if (match) {
      const title = match[1];
      
      let content: string[] = [];
      if (match[2]) {
        if (match[2].includes(',')) {
          content = match[2].split(',').map(item => item.trim());
        } else if (match[2].includes('\n')) {
          content = match[2].split('\n').map(item => item.trim().replace(/^[-•*]\s*/, ''));
        } else {
          content = [match[2].trim()];
        }
      }
      
      try {
        return NoteRequestSchema.parse({
          action: 'create',
          title,
          content
        });
      } catch (e) {
        return null;
      }
    }
  }
  
  // Handle update commands
  const updatePatterns = [
    /add\s+(.+?)\s+to\s+(?:my\s+)?['"](.+?)['"](?:\s+note)?/i,
    /update\s+(?:my\s+)?['"](.+?)['"](?:\s+note)?\s+(?:with|to(?:\s+add)?)\s+(.+)/i,
    /append\s+(.+?)\s+to\s+(?:my\s+)?['"](.+?)['"](?:\s+note)?/i
  ];
  
  for (const pattern of updatePatterns) {
    const match = text.match(pattern);
    if (match) {
      let content: string, title: string;
      
      if (lowerText.includes("update") && match[1]) {
        title = match[1];
        content = match[2];
      } else {
        content = match[1];
        title = match[2];
      }
      
      if (title && content) {
        try {
          return NoteRequestSchema.parse({
            action: 'update',
            title,
            content: [content.trim()]
          });
        } catch (e) {
          return null;
        }
      }
    }
  }
  
  // Handle delete commands
  const deletePatterns = [
    /delete\s+(?:my\s+)?(?:note\s+)?['"](.+?)['"](?:\s+note)?/i,
    /remove\s+(?:my\s+)?(?:note\s+)?['"](.+?)['"](?:\s+note)?/i,
    /trash\s+(?:my\s+)?(?:note\s+)?['"](.+?)['"](?:\s+note)?/i,
    /get\s+rid\s+of\s+(?:my\s+)?(?:note\s+)?['"](.+?)['"](?:\s+note)?/i
  ];
  
  for (const pattern of deletePatterns) {
    const match = text.match(pattern);
    if (match) {
      const title = match[1];
      try {
        return NoteRequestSchema.parse({
          action: 'delete',
          title
        });
      } catch (e) {
        return null;
      }
    }
  }
  
  // Handle search commands
  const searchPatterns = [
    /(?:search|find|look\s+for)\s+(?:my\s+)?(?:note\s+)?['"](.+?)['"](?:\s+note)?/i,
    /(?:search|find|look)\s+(?:for\s+)?(?:notes?\s+)?(?:with|containing|about)\s+['"](.+?)['"](?:\s+note)?/i
  ];
  
  for (const pattern of searchPatterns) {
    const match = text.match(pattern);
    if (match) {
      const title = match[1];
      try {
        return NoteRequestSchema.parse({
          action: 'search',
          title
        });
      } catch (e) {
        return null;
      }
    }
  }
  
  // Handle simple creation with quoted title
  if (lowerText.includes('create') || lowerText.includes('new') || lowerText.includes('make')) {
    const titleMatch = text.match(/['"](.+?)['"]/) || text.match(/note\s+(?:about|on|for)\s+(.+?)(?:\s|$)/i);
    if (titleMatch) {
      try {
        return NoteRequestSchema.parse({
          action: 'create',
          title: titleMatch[1],
          content: []
        });
      } catch (e) {
        return null;
      }
    }
  }
  
  return null;
}

/**
 * Generates AppleScript code based on the parsed request
 */
export function generateAppleScript(request: NoteRequest): string {
  const safeTitle = request.title.replace(/"/g, '\\"');
  const safeContent = request.content?.map(item => item.replace(/"/g, '\\"')) || [];
  
  switch (request.action) {
    case 'create':
      return `
        tell application "Notes"
          set newNote to make new note with properties {name:"${safeTitle}"}
          ${safeContent.map(item => `tell newNote to make new paragraph at the end with data "${item}"`).join('\n') || ''}
        end tell
      `;
    
    case 'update':
      return `
        tell application "Notes"
          set noteFound to false
          repeat with theNote in notes
            if name of theNote is "${safeTitle}" then
              set noteFound to true
              tell theNote
                ${safeContent.map(item => `make new paragraph at the end with data "${item}"`).join('\n') || ''}
              end tell
              exit repeat
            end if
          end repeat
          if not noteFound then
            set newNote to make new note with properties {name:"${safeTitle}"}
            ${safeContent.map(item => `tell newNote to make new paragraph at the end with data "${item}"`).join('\n') || ''}
          end if
        end tell
      `;
    
    case 'delete':
      return `
        tell application "Notes"
          set noteFound to false
          repeat with theNote in notes
            if name of theNote is "${safeTitle}" then
              set noteFound to true
              delete theNote
              exit repeat
            end if
          end repeat
        end tell
      `;
    
    case 'search':
      return `
        tell application "Notes"
          set matchingNotes to {}
          repeat with theNote in notes
            if name of theNote contains "${safeTitle}" then
              set end of matchingNotes to name of theNote
            end if
          end repeat
          return matchingNotes
        end tell
      `;
    
    default:
      return '';
  }
}

/**
 * Executes an AppleScript and returns the result
 */
export function executeAppleScript(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tempFile = `/tmp/notescript_${Date.now()}.scpt`;
    const writeCmd = `echo '${script.replace(/'/g, "'\\''")}' > ${tempFile}`;
    
    exec(writeCmd, writeErr => {
      if (writeErr) {
        return reject(`Error writing script: ${writeErr}`);
      }
      
      exec(`osascript ${tempFile}`, (execErr, stdout, stderr) => {
        exec(`rm ${tempFile}`);
        
        if (execErr) {
          return reject(`AppleScript execution error: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  });
}

// Express endpoint for local testing
app.post('/process-note-request', async (req, res) => {
  try {
    const { text } = RequestBodySchema.parse(req.body);
    const parsedRequest = parseNaturalLanguage(text);
    
    if (!parsedRequest) {
      return res.status(400).json({ 
        error: "Could not understand the request", 
        supportedFormats: [
          "Create a note titled 'x' with items: a, b, c",
          "Add x to my 'y' note",
          "Delete my 'x' note"
        ]
      });
    }
    
    const script = generateAppleScript(parsedRequest);
    const result = await executeAppleScript(script);
    
    return res.json({
      success: true,
      action: parsedRequest.action,
      title: parsedRequest.title,
      result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation error", 
        details: error.errors 
      });
    }
    
    return res.status(500).json({ error: String(error) });
  }
});

// Start Express server only in development mode
if (process.env.START_EXPRESS_SERVER === 'true') {
  app.listen(PORT, () => {
    console.log(`Notes integration service running on port ${PORT}`);
  });
}