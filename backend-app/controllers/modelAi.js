const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Function to handle image uploads and predictions
exports.uploadAndPredict = async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded.' });
    }

    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path), req.file.originalname);

    try {
        const response = await axios.post('Fill with your API Models Predict', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        fs.unlink(req.file.path, err => {
            if (err) console.error('Failed to delete file:', err);
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error sending image to Flask:', error);
        res.status(500).send({ message: 'Error processing image', error: error.message });
    }
};

// Function to retrieve prediction history
exports.getHistory = async (req, res) => {
    try {
        const response = await axios.get('Fill with your API Models History');
        res.json(response.data);
    } catch (error) {
        console.error('Error retrieving history from Flask:', error);
        res.status(500).send({ message: 'Error retrieving history', error: error.message });
    }
};

// Function to delete a specific prediction
exports.deletePrediction = async (req, res) => {
    try {
        const response = await axios.delete(`Fill with your API Models Delete${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error deleting prediction in Flask:', error);
        res.status(500).send({ message: 'Error deleting prediction', error: error.message });
    }
};
