import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Test server is running' });
});

// Test branch routes
const branchRouter = express.Router();
branchRouter.get('/', (req, res) => res.json({ message: 'Get all branches' }));
branchRouter.get('/:id', (req, res) => res.json({ message: 'Get branch by ID' }));
branchRouter.get('/within/distance', (req, res) => 
    res.json({ 
        message: 'Get branches within distance',
        query: req.query 
    })
);

app.use('/api/v1/branches', branchRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
