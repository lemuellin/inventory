const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DesignSchema = new Schema({
    name: {type: String, required: true},
    descr: {type: String, required: true}
});

DesignSchema.virtual('url').get(function(){
    return `/catalog/design/${this._id}`;
});

module.exports = mongoose.model('Design', DesignSchema);