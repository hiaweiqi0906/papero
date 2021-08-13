const mongoose = require('mongoose')

const BookSchema = mongoose.Schema({
    bookTitle:{
        type: String,
        required: true,
    },
    coverImgUri:{
        type: String,
        required: true,
    },
    imageUri:{
        type: Array,
    },
    price:{
        type: Number,
        required: true
    },
    description:{
        type: String,
        required: true,
    }, 
    category:{
        type: String,
        required: true,
        // Comics & Manga
        // Children's Books
        // Agriculture, Forestry & Fishery
        // Arts, Design & Photography
        // Recipes & Cooking
        // Business & Investment
        // Politics, Law & Social Sciences
        // Computers & Technology
        // Health, Fitness & Dieting
        // Travel & Tourism
        // Language Learning & Dictionaries
        // Hobbies
        // Classic Literature
        // Fantasy
        // Action, Crime & Thrillers
        // Romance
        // Biography & Memoirs
        // Science & Maths
        // Medical
        // Parenting & Family
        // Psychology & Relationships
        // Religion & Philosophy
        // History & Cultures
        // Careers, Self Help & Personal Development
        // Horoscopes
        // Education & School
        // Sticker & Colouring Books
        // Music
        // Baby & Soft Books
        // Audio Books
        // Others
    },
    uploadedBy:{
        type: String,
        required: true,
    },
    uploadedAt:{
        type: Date,
        require: true,
        default: Date.now
    },
    publishingCompany:{
        type: String,
    },
    language:{
        type: String,
        required: true,
    },
    isbn:{
        type: Number,
    },
    coverType:{
        type: String,
    },
    year:{
        type: Number,
        required: true,
    },
    quantity:{
        type: Number,
    }
})

const Book = mongoose.model('Book', BookSchema)
module.exports = Book