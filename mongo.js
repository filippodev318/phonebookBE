const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

// const url = `mongodb+srv://pippodb:${password}@cluster0.nqlmmoi.mongodb.net/notes`
const url = `mongodb+srv://pippoDB:${password}@cluster0.asxhiua.mongodb.net/phonebook`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const phoneContact = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Contact', phoneContact)

if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({
    name: name,
    number: number
  })

  person.save().then(result => {
    console.log(`Added ${result.name} ${result.number} to phonebook`)
    mongoose.connection.close()
  })
} else if (process.argv.length === 3) {
  Person.find({}).then(result => {
    console.log('Phonebook:')
    result.forEach(contact => {
      console.log(`${contact.name} ${contact.number}`)
    })
    mongoose.connection.close()
  })
}
