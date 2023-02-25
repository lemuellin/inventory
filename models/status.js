const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const StatusSchema = new Schema({
    drill: {type: Schema.Types.ObjectId, ref: 'Drill', required: true},
    amount: {type: Number, required: true},
    location: {
        type: String,
        required: true,
        enum: ["Tech Center", "Warehouse"],
        default: "Tech Center", 
    },
    descr: {type: String}
});

StatusSchema.virtual('url').get(function(){
    return `/catalog/status/${this._id}`;
});

module.exports = mongoose.model('Status', StatusSchema);