const {model, Schema} = require("mongoose");

const AdminSchema = new Schema({
    username:{
        type: String,
        required: true
    },
    isAdmin:{
        type: Boolean,
        required: false,
        default: true
    },
    password:{
        type: String,
        required: true
    }
});

module.exports = Admin = model("Admin", AdminSchema);