const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EmailTokenSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    token: {type: String, required: true},
    createdAt: {type: Date, default: Date.now(), expires: 3600}
})

module.exports = mongoose.model("EmailToken", EmailTokenSchema)