require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express() 
const Person = require('./models/person')
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

app.get('/api/persons', (request, response) => {
    Person.find({}).then(person => {
        response.json(person)
    })
})

app.get('/info', (request, response) => {
    Person.count({}).then(count => {
        const info = {
            content: `<p>Phonebook has info for ${count} people</p>`,
            date: `<p>${new Date()}</p>` 
        }
        response.write(info.content)
        response.write(info.date)
    })
})

app.get('/api/persons/:id', (request, response) => {

    Person.findById(request.params.id)
        .then(person => {
            if(person) {
                response.json(person)
            } else {
                response.status(400).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error)) 
})

const generateID = () => Math.floor(Math.random()* 10000)

app.put('/api/persons/:id', (request,response) => { 
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
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
    } 

    const person = new Person({
        id: generateID(),
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.use(morgan('tiny'))

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }
    if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }

    next(error)
}

app.use(errorHandler)