import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import knex from 'knex';

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1', // <- localhost
      user : 'postgres',
      password : "123",
      database : 'smart-brain'
    }
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cors());


app.get('/', (req, res) => {
    res.send("Success");
});

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if(isValid){
            db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json("Unable to get user"))
        }else{
            res.status(400).json("Wrong Credentials")
        }
        
    })
    .catch(err => res.status(400).json('Wrong Credentials'));
});

app.post('/register', (req, res) => {
    const {email, password, name} = req.body;
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0],
                name: name,
                joined: new Date()
            })
            .then(user =>{
                res.json(user[0]);
            })   
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('Unable to Register'));  
});



app.get('/profile/:id', (req, res) => {
    const {id} = req.params;
    
    db.select('*').from('users').where({
        id: id
    })
    .then(user => {
        if(user.length){
            res.json(user[0])
        }else{
            res.status(400).json('Error getting user');
        }  
    })
    .catch(err => res.status(400).json('Error getting user'));
});

app.put('/image', (req, res) => {
    const {id} = req.body;
    
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    }).catch(err => res.status(400).json('Unable to get entries'))
});


app.listen(3000, () => {
    console.log('App is running on port 3000');
});
