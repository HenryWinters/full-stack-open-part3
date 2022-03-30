const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express() 
app.use(cors())
app.use(express.json())
app.use(express.static('build'))
morgan.token('post', function (request, response) { return JSON.stringify(request.body) })
app.use(morgan(function (tokens, req, res) {
    if (tokens.post(req, res) !== '{}') { 
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms',
            tokens.post(req, res)
        ].join(' ')
    } else return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms'
        ].join(' ')
  }))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const numberOfPersons = persons.length
    const info = {
        content: `<p>Phonebook has info for ${numberOfPersons} people</p>`,
        date: `<p>${new Date()}</p>` 
    }
    response.write(info.content)
    response.write(info.date)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else { 
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    
    response.status(204).end()
})

const generateID = () => Math.floor(Math.random()* 10000)

app.put('/api/persons/:id', (request,response) => { 
    const body = request.body
    persons = persons.map((person) => person.id === body.id ? {...person, number: body.number} : person)
    response.json(body)
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name is missing'
        }) 
    } else 
    if (!body.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    } else
    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({ 
            error: 'name must be unique'
        })
    } else 
    if (persons.find(person => person.number === body.number)) {
        return response.status(400).json({
            error: 'number must be unique'
        }) 
    } 

    const person = {
        id: generateID(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    response.json(person)
})

app.use(morgan('tiny'))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

