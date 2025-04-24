import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { parseNaturalLanguage, generateAppleScript, executeAppleScript } from "./notes-integration-service.js";

// Prevent Express server from starting in MCP mode
process.env.START_EXPRESS_SERVER = 'false';

// Define the MCP server
const server = new McpServer({
  name: "NotesY",
  version: "1.0.0"
});

// Process natural language note requests
server.tool("process_note_request", { 
  text: z.string().min(1) 
}, async ({ text }) => {
  try {
    // Handle JSON input if present
    let processedText = text;
    if (text.trim().startsWith('{') && text.includes('text')) {
      try {
        const jsonData = JSON.parse(text);
        if (jsonData.text) {
          processedText = jsonData.text;
        }
      } catch (err) {
        // Continue with original text
      }
    }
    
    // Process the text request
    const parsedRequest = parseNaturalLanguage(processedText);
    
    if (!parsedRequest) {
      return {
        content: [{ 
          type: "text", 
          text: "I couldn't understand your request. Try phrasing it like:\n- Create a note titled 'shopping list' with items: milk, eggs, bread\n- Add meeting notes to my 'work' note\n- Delete my 'old tasks' note\n- Search for notes with 'project'"
        }]
      };
    }
    
    // Execute the AppleScript
    const script = generateAppleScript(parsedRequest);
    const result = await executeAppleScript(script);
    
    // Format the response based on action type
    let responseText = "";
    switch (parsedRequest.action) {
      case 'create':
        responseText = `Successfully created note "${parsedRequest.title}"`;
        break;
      case 'update':
        responseText = `Successfully updated note "${parsedRequest.title}"`;
        break;
      case 'delete':
        responseText = `Successfully deleted note "${parsedRequest.title}"`;
        break;
      case 'search':
        if (result && result.trim()) {
          const notes = result.split(',').map(note => note.trim());
          responseText = `Found ${notes.length} note(s) matching "${parsedRequest.title}":\n${notes.map(note => `- ${note}`).join('\n')}`;
        } else {
          responseText = `No notes found matching "${parsedRequest.title}"`;
        }
        break;
    }
    
    return {
      content: [{ type: "text", text: responseText }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }]
    };
  }
});

// Start the MCP server
const transport = new StdioServerTransport();
await server.connect(transport);
