const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

mongoose.connect(url).then(result => {
    console.log('connected to MongoDB')
}).catch((error) => {
    console.log('error connecting to MongoDB: ', error.message)
})

const phoneContact = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3
    },
    number: {
        type: String,
        minLength: 8,
        validate: {
            validator: function (v) {
                return /\d{2,3}-\d{1,}/.test(v)
            }
        }
    },
})

phoneContact.set('toJSON', {
    transform: (document, returnedObj) => {
        returnedObj.id = returnedObj._id.toString()
        delete returnedObj._id
        delete returnedObj.__v
    }
})

module.exports = mongoose.model('Contact', phoneContact)

