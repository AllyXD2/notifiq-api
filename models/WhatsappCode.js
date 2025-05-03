const mongoose = require('mongoose')
const Schema = mongoose.Schema

const WhatsappCodigoSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    codigo: {type: String, required: true},
    createdAt: {type: Date, default: Date.now(), expires: 3600}
})

module.exports = mongoose.model("WhatsappCodigo", WhatsappCodigoSchema)