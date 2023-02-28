const Record = require('../models/record');

// Display list of all records
exports.record_list = (req, res) => {
    Record.find()
    .sort({drill: 1})
    .populate('drill')
    .exec(function(err, list_records){
        if(err){
            return next(err)
        }
        //Successful, so render
        res.render('record_list', {title: 'List of Records', record_list: list_records});
    });
}

// Display details of specific record
exports.record_detail = (req, res, next) => {
    Record.findById(req.params.id)
    .populate('drill')
    .exec((err, record) => {
        if(err){
            return next(err);
        }
        if(record == null){
            // No Results.
            const err = new Error('Record not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('record_detail', {
            title: record.drill.part_num,
            record,
        });
    });
}

// Create
exports.record_create_get = (req, res) => {
    res.send("NOT IMPLEMENTED: Record Create GET");
}

exports.record_create_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Record Create POST");
}

// Delete
exports.record_delete_get = (req, res) => {
    res.send("NOT IMPLEMENTED: Record Delete GET");
}

exports.record_delete_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Record Delete POST");
}

// Update
exports.record_update_get = (req, res) => {
    res.send("NOT IMPLEMENTED: Record Update GET");
}

exports.record_update_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Record Update POST");
}