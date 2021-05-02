import Clarifai from 'clarifai';

const app = new Clarifai.App({
 apiKey: '6d0b6ab4d5da486598a2c03d4b164a46'
});

const handleApiCall = (req, res) => {
    app.models
    .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data => {
        res.json(data)
    })
    .catch(err => res.status(400).json('Unable to work with API'))
}


const handleImage = (req, res, db) => {
    const {id} = req.body;
    
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    }).catch(err => res.status(400).json('Unable to get entries'))
}

export default {
    handleImage,
    handleApiCall
}