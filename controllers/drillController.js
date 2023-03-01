const Drill = require('../models/drill');
const Design = require('../models/design');
const Record = require('../models/record');

const async = require('async');

const { body, validationResult } = require('express-validator');
const { design_list } = require('./designController');

exports.index = (req, res) => {
    async.parallel(
        {
            drill_count(callback){
                Drill.countDocuments({}, callback);
            },
            design_count(callback){
                Design.countDocuments({}, callback);
            },
            record_count(callback){
                Record.countDocuments({}, callback);
            },
            record_tech_center_count(callback){
                Record.countDocuments({location: 'Tech Center'}, callback);
            },
            record_warehouse_count(callback){
                Record.countDocuments({location: 'Warehouse'}, callback);
            },
        },
        (err, results) => {
            res.render('index', {
                title: 'TCT Tech Center Inventory',
                error: err,
                data: results,
            });
        }
    );
}

// Display list of Drills
exports.drill_list = (req, res) => {
    Drill.find({}, 'part_num')
    .sort({part_num: 1})
    .exec(function(err, list_drills){
        if(err){
            return next(err);
        }
        // Successful, so render
        res.render('drill_list', {title: 'List of Drills', drill_list: list_drills});
    });

}

// Display specific drill
exports.drill_detail = (req, res, next) => {
    async.parallel(
        {
            drill(callback){
                Drill.findById(req.params.id)
                .populate('design')
                .exec(callback);
            },
            drill_record(callback){
                Record.find({drill: req.params.id})
                .populate('drill')
                .exec(callback);
            }
        }, 
        (err, results) => {
            if(err){
                return next(err);
            }
            if(results.drill == null){
                // No Results
                const err = new Error('Drill not found');
                err.status = 404;
                return next(err);
            }
            //Successful, so render
            res.render('drill_detail', {
                title: results.drill.part_num,
                drill: results.drill,
                records: results.drill_record,
            });
        }
    );
}

// Create
exports.drill_create_get = (req, res, next) => {
    Design.find({}, 'name').exec((err, designs) => {
        if(err){
            return next(err);
        }

        // Successful, so render
        res.render('drill_form', {
            title: 'Create Drill',
            designs: designs,
        });
    })
}

exports.drill_create_post = [

    // Validate and Sanitize data
    body('part_num', 'Part Number must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('design', 'Design must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('descr')
        .trim()
        .escape(),
    
    // Process request after validation and sanitization
    (req, res, next) => {
        // Extract validation errors
        const errors = validationResult(req);

        // Create Drill Objects with escaped and trimmed data
        const drill = new Drill({
            part_num: req.body.part_num,
            design: req.body.design,
            descr: req.body.descr,
        });

        if(!errors.isEmpty()){
            // There are errors, render form again with sanitized data
            Design.find({}, 'name').exec((err, designs) => {
                if(err){
                    return next(err);
                }
        
                // Successful, so render
                res.render('drill_form', {
                    title: 'Create Drill',
                    designs: designs,
                    drill,
                });
            })

        }

        // Data from form is valid, save Drill
        drill.save((err) => {
            if(err){
                return next(err);
            }

            // Successful, redirect
            res.redirect(drill.url);
        });
    },
];

// Delete
exports.drill_delete_get = (req, res, next) => {
    async.parallel(
        {
            drill(callback){
                Drill.findById(req.params.id).exec(callback);
            },
            drill_records(callback){
                Record.find({drill: req.params.id}).exec(callback);
            },
        },
        (err, results) => {
            if(err){
                return next(err);
            }
            if(results.drill === null){
                // No Results
                res.redirect('/catalog/drills');
            }

            // Successful, so render
            res.render('drill_delete', {
                title: 'Delete Drill',
                drill: results.drill,
                drill_records: results.drill_records,
            });
        }
    );
}

exports.drill_delete_post = (req, res, next) => {
    async.parallel(
        {
            drill(callback){
                Drill.findById(req.body.drillid).exec(callback);
            },
            drill_records(callback){
                Record.find({drill: req.body.drillid}).exec(callback);
            },
        },
        (err, results) => {
            if(err){
                return next(err)
            }

            // Success
            if(results.drill_records.length > 0){
                // Drill has Records. Render in the same way as GET route
                res.render('drill_delete', {
                    title: 'Delete Drill',
                    drill: results.drill,
                    drill_records: results.drill_records,
                });
                return;
            }

            // Drill has no Record related. Delete object, return the list of drills
            Drill.findByIdAndRemove(req.body.drillid, (err) => {
                if(err){
                    return next(err);
                }

                //Success, redirect
                res.redirect('/catalog/drills');
            });
        }
    );
}

// Update
exports.drill_update_get = (req, res, next) => {
    // Get Drill, Design for form
    async.parallel(
        {
            drill(callback){
                Drill.findById(req.params.id)
                .populate('design')
                .exec(callback);
            },
            designs(callback){
                Design.find(callback);
            },
        },
        (err, results) => {
            if(err){
                return next(err)
            }

            if(results.drill == null){
                // No Results
                const err = new Error('Book not found');
                err.status = 404;
                return next(err);
            }

            // Success
            res.render('drill_form', {
                title: 'Update Drill',
                drill: results.drill,
                designs: results.designs,
            });
        }
    );
}

exports.drill_update_post = [
    // Validate and Sanitize data
    body('part_num', 'Part Number must not be empty.')
    .trim()
    .isLength({min:1})
    .escape(),
    body('design', 'Design must not be empty.')
    .trim()
    .isLength({min:1})
    .escape(),
    body('descr')
    .trim()
    .escape(),

    // Process Request after validation and sanitization
    (req, res, next) => {
        // Extract validaiton error from request
        const errors = validationResult(req);

        // Create a Drill object with validated and sanitized data
        const drill = new Drill({
            part_num: req.body.part_num,
            design: req.body.design,
            descr: req.body.descr,
            _id: req.params.id,  // This is required, or a new ID will be assigned!
        })

        if(!errors.isEmpty()){
            // There are errors. Render form again with sanitized data 
            Design.find().exec((err, results) => {
                if(err){
                    return next(err);
                }
                res.render('drill_form', {
                    title: 'Update Drill',
                    drill,
                    design: results,
                    errors: errors.array(),
                });
            });
            return;
        }

        // Data from form is valid. Update the record
        Drill.findByIdAndUpdate(req.params.id, drill, {}, (err, thedrill) => {
            if(err){
                return next(err);
            }

            //Success, redirect to the drill detail page
            res.redirect(thedrill.url);
        });
    }
];