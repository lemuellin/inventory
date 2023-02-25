const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DrillSchema = new Schema({
    part_num: {type: String, required: true, maxLength: 24},
    design: {type: Schema.Types.ObjectId, ref:'Design', required: true},
    descr: {type: String}
});

DrillSchema.virtual("url").get(function(){
    return `/catalog/drill/${this._id}`;
})

module.exports = mongoose.model('Drill', DrillSchema);