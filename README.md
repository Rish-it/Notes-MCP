# NotesY - Apple Notes Integration for Claude

A Claude MCP integration that allows seamless interaction with Apple Notes through natural language.

## Features

* Create notes with content and titles
* Update existing notes with new content
* Delete notes by title
* Search for notes containing specific text
* Automatically detect trip planning requests and create notes

## Installation

1. Clone and build the project:
```bash
git clone https://github.com/yourusername/NotesY.git
cd NotesY
npm install
npm run build
```

2. Add to Claude's configuration (usually at `~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "NotesY": {
      "command": "node",
      "args": ["/absolute/path/to/NotesY/dist/index.js"]
    }
  }
}
```

## Usage

### With Claude Desktop

Simply talk to Claude Desktop and ask it to:

```
Create a note titled 'shopping list' with items: milk, eggs, bread

Add meeting notes to my 'work' note

Delete my 'old tasks' note

Search for notes with 'project'
```

You can also just give Claude long text and it will create a note with appropriate title:

```
Create a comprehensive trip plan for Krabi, Thailand, including recommended duration, best time to visit, must-see attractions, accommodation options, transportation tips, food recommendations, and budget considerations.
```

### Using the CLI

For testing without Claude, you can use the built-in CLI:

```bash
npm run cli
```

This lets you enter natural language commands directly and see the results.

## Local Development

```bash
git clone https://github.com/yourusername/NotesY.git
cd NotesY
npm install
npm run build
npm run dev
```

To run the Express server for API testing:
```bash
START_EXPRESS_SERVER=true npm run dev
```

## How it Works

NotesY uses AppleScript to interact with the macOS Notes app, providing natural language understanding through an MCP integration with Claude Desktop.
