const Record = require('../models/record');
const Drill = require('../models/drill');

const async = require('async');
const { body, validationResult } = require('express-validator');

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
exports.record_create_get = (req, res, next) => {
    Drill.find({}, 'part_num').exec((err, drills) => {
        if(err){
            return next(err);
        }

        //Successful, so render
        res.render('record_form', {
            title: 'Create Record',
            drill_list: drills,
        });
    })
}

exports.record_create_post = [

    // Validate and Sanitize Data
    body('drill', 'Part Number must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body('amount', 'Amount must be an integar, and larger than 0')
    .trim()
    .isLength({ min: 1 })
    .isInt({ min:0 })
    .escape(),
    body('location')
    .escape(),
    body('descr')
    .escape(),

    // Process Request after validation and sanitization
    (req, res, next) => {
        // Extract the validation errors from a request
        const errors = validationResult(req);

        // Create Record with escaped and trimmed data
        const record = new Record({
            drill: req.body.drill,
            amount: req.body.amount,
            location: req.body.location,
            descr: req.body.descr,
        })

        if(!errors.isEmpty()){
            // There are errors, render form again with sanitized value and error msg
            Drill.find({}, 'part_num').exec((err, drills) => {
                if(err){
                    return next(err);
                }

                //Successful, so render
                res.render('record_form', {
                    title: 'Create Record',
                    drill_list: drills,
                })
            })
            return;
        }

        // Data from form is valid
        record.save((err) => {
            if(err){
                return next(err);
            }

            // Successful, so render
            res.redirect(record.url);
        })
    }
]

// Delete
exports.record_delete_get = (req, res, next) => {
    Record.findById(req.params.id).exec((err, results) => {
        if(err){
            return next(err);
        }

        if(results === null){
            // No Results
            res.redirect('/catalog/records');
        }

        res.render('record_delete', {
            title: 'Delete Record',
            record: results,
        });
    })
}

exports.record_delete_post = (req, res, next) => {
    Record.findByIdAndRemove(req.body.recordid, (err) => {
        if(err){
            return next(err);
        }

        // Success, redirect to list of records
        res.redirect('/catalog/records');
    });
}

// Update
exports.record_update_get = (req, res, next) => {
    async.parallel(
        {
            record(callback){
                Record.findById(req.params.id).populate('drill').exec(callback);
            },
            drill(callback){
                Drill.find(callback);
            }
        },
        (err, results) => {
            if(err){
                return next(err);
            }

            if(results.record == null){
                // No record
                const err = new Error('Record not found.')
                err.status = 404;
                return next(err);
            }

            // Success, so render
            res.render('record_form', {
                title: 'Update Record',
                record: results.record,
                drill_list: results.drill,
                selected_drill: results.record.drill._id,
                selected_location: results.record.location,
            })
        }
    );
}

exports.record_update_post = [
    // Validate and Sanitize data from form
    body('amount', 'Amount must be an integar, and larger than 0')
    .trim()
    .isLength({ min: 1 })
    .isInt({ min:0 })
    .escape(),
    body('location')
    .escape(),
    body('descr')
    .escape(),

    // Process Request after validate and sanitize data
    (req, res, next) => {
        // Extract validation error
        const errors = validationResult(req);

        // Create a Record Object from sanitized data
        const record = new Record({
            drill: req.body.drill,
            amount: req.body.amount,
            location: req.body.location,
            descr: req.body.descr,
            _id: req.params.id, // This is required, or a new ID will be assigned!
        })

        if(!errors.isEmpty()){
            // there are errors, render form again with sanitized data
            Drill.find().exec((err, results) => {
                if(err){
                    return next(err);
                }

                res.render('record_form', {
                    title: 'Update Record',
                    record,
                    selected_drill: results.record.drill._id,
                    selected_location: results.record.location,
                    drill_list: results,
                    errors: errors.array(),
                });
            });
            return;
        }

        // Data from form is valid, update the record
        Record.findByIdAndUpdate(req.params.id, record, {}, (err, therecord) => {
            if(err){
                return next(err);
            }

            //Success, redirect to the detail page of record
            res.redirect(therecord.url);
        });
    }
];