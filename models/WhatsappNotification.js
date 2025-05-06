const mongoose = require('mongoose')
const Schema = mongoose.Schema

const WhatsappNotificationSchema = new Schema({
    atividade: {type: Schema.ObjectId, ref: "Atividade", required: true},
    user: {type: Schema.ObjectId, ref: "User", required: true},
    dataHorario: {type: String, required: true}
})

module.exports = mongoose.model("WhatsappNotification", WhatsappNotificationSchema)