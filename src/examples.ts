/**
 * NotesY - Examples
 * 
 * This file contains examples of how to use NotesY with Claude
 */

/**
 * Create a note with items
 * 
 * Example: 
 * "Create a note titled 'shopping list' with items: milk, eggs, bread"
 */
export const createNoteExample = `
Claude, can you create a note titled 'shopping list' with items: milk, eggs, bread, cheese, apples?
`;

/**
 * Add content to an existing note
 * 
 * Example:
 * "Add meeting notes to my 'work' note"
 */
export const updateNoteExample = `
Claude, can you add "Call Sarah about the project deadline" to my 'work tasks' note?
`;

/**
 * Delete a note
 * 
 * Example:
 * "Delete my 'old tasks' note"
 */
export const deleteNoteExample = `
Claude, please delete my 'old tasks' note
`;

/**
 * Search notes
 * 
 * Example:
 * "Search for notes with 'project'"
 */
export const searchNotesExample = `
Claude, can you find all my notes about 'recipes'?
`;

/**
 * Create a trip plan
 * 
 * Example:
 * "Create a trip plan for Bali with details about accommodations and activities"
 */
export const tripPlanExample = `
Claude, I need a trip plan for Bali, Indonesia. Please include information about the best time to visit, 
recommended accommodations, top activities, transportation options, and estimated costs.
`;

/**
 * Free-form note creation
 * 
 * The system will automatically detect long text and create a note with an appropriate title
 */
export const freeformNoteExample = `
Claude, please take a note about this meeting:

Project Status Update - Q3 Review
Attendees: Sarah, John, Michael, and Jessica
Date: October 15, 2023

Key Discussion Points:
1. Q3 targets were achieved with 15% growth
2. New product launch delayed until November
3. Marketing campaign performing above expectations
4. Budget adjustments needed for Q4

Action Items:
- Sarah to prepare updated forecast by Friday
- John to schedule meeting with the development team
- Michael to revise marketing materials
- Jessica to review budget proposals
`; 