const User = require("../models/User")

exports.getUser = (req, res) =>{
    const { userId } = req.body

    const user = User.findById(userId).select('-senhaHash');

    if(!user) return res.status(404).json({message: "Usuário não encontrado"})

    return res.status(200).json({user: user})
}