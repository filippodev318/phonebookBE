require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

const Contact = require('./contact')

morgan.token('data-resp', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data-resp'))

let persons = [
]

// const requestLogger = (request, response, next) => {
//     console.log('Method:', request.method)
//     console.log('Path:  ', request.path)
//     console.log('Body:  ', request.body)
//     console.log('---')
//     next()
// }

// app.use(requestLogger)


app.get('/', (request, response) => {
    response.send('<h1>Phonebook BackEnd!</h1>')
})

app.get('/info', (request, response) => {
    const date = new Date()
    const textMessage = `Phonebook has info for ${persons.length} person \n\n ${date.toString()}`
    response.send(textMessage)
})

// GET ALL PHONE CONTACTS
app.get('/api/persons', (request, response) => {
    Contact.find({}).then(result => {
        console.log(result)
        response.json(result)
    })
})

// GET A PHONE CONTACT BY ID
app.get('/api/persons/:id', (request, response, next) => {
    Contact.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})


// UPDATE PHONE CONTACT
app.put('/api/persons/:id', (request, response, next) => {
    const id = request.params.id

    const person = {
        name: request.body.name,
        number: request.body.number
    }

    Contact.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedContact => {
            response.json(updatedContact)
        })
        .catch(error => next(error))
})

// DELETE PHONE CONTACT
app.delete('/api/persons/:id', (request, response, next) => {
    Contact.findOneAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})


// ADD A NEW PHONE CONTACT
app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name is missing'
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
    }
    Contact.find({ name: person.name }).then(result => {
        if (result && result.length > 0) {
            const id = result[0]._id.toString()
            const person = {
                name: body.name,
                number: body.number,
            }
            Contact.findByIdAndUpdate(id, person, { new: true })
                .then(updatedContact => {
                    response.json(updatedContact)
                })
                .catch(error => next(error))
        } else {
            const tmpPerson = new Contact({
                name: body.name,
                number: body.number
            })
            tmpPerson.save().then(result => {
                console.log(`Added ${result.name} ${result.number} to phonebook`)
                response.json(tmpPerson)
            }).catch(error => next(error))
        }
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT)
console.log(`phonebook server running on ${PORT}`)