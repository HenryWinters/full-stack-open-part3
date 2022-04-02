const mongoose = require('mongoose')

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]
const url = `mongodb+srv://hlwinters:${password}@cluster0.5ar7m.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
    name: name, 
    number: number
})

if (process.argv.length > 3) {
    person.save().then(result => {
        console.log(`Added ${name} ${number} to phonebook`)
        mongoose.connection.close()
    })
} 
else if (process.argv.length === 3) {
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })
}