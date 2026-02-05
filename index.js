const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const FILE = 'notes.json';

// Read notes
function readNotes() {
    try {
        if (!fs.existsSync(FILE)) {
            fs.writeFileSync(FILE, JSON.stringify([]));
        }
        return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    } catch (error) {
        console.error('Error reading notes:', error);
        return [];
    }
}

// Write notes
function writeNotes(notes) {
    try {
        fs.writeFileSync(FILE, JSON.stringify(notes, null, 2));
    } catch (error) {
        console.error('Error writing notes:', error);
        throw error;
    }
}

// GET
app.get('/notes', (req, res) => {
    try {
        res.json(readNotes());
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// POST
app.post('/notes', (req, res) => {
    try {
        const { text } = req.body;

        // Validate input
        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Note text is required' });
        }

        const notes = readNotes();
        const newNote = {
            id: Date.now(),
            text: text.trim()
        };

        notes.push(newNote);
        writeNotes(notes);
        res.json(newNote);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add note' });
    }
});

// DELETE
app.delete('/notes/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }

        let notes = readNotes();
        const initialLength = notes.length;
        notes = notes.filter(n => n.id !== id);
        
        if (notes.length === initialLength) {
            return res.status(404).json({ error: 'Note not found' });
        }

        writeNotes(notes);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
