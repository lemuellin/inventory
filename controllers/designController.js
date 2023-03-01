const Design = require('../models/design');
const Drill = require('../models/drill');

const async = require('async');
const {body, validationResult} = require('express-validator');

// Display list of all Designs
exports.design_list = (req, res) => {
    Design.find()
    .sort({name: 1})
    .exec(function(err, list_designs){
        if(err){
            return next(err)
        }
        //Successful, so render
        res.render('design_list', {title:'List of Designs', design_list: list_designs});
    })
}

// Display detail page for a specific Design
exports.design_detail = (req, res, next) => {
    async.parallel(
        {
            design(callback){
                Design.findById(req.params.id).exec(callback);
            },
            design_drills(callback){
                Drill.find({design: req.params.id}).exec(callback);
            },
        },
        (err, results) => {
            if(err){
                return next(err);
            }
            if(results.design == null){
                // No Results
                const err = new Error("Design not found");
                err.status = 404;
                return next(err);
            }
            // Successful, so render
            res.render('design_detail', {
                title: 'Design Detail',
                design: results.design,
                design_drills: results.design_drills,
            });
        }
    );
}

// Display Design Create form on GET
exports.design_create_get = (req, res, next) => {
    res.render('design_form', {title: 'Create Design'});
}

// Handle Design Create on POST
exports.design_create_post = [
    // Validate and sanitize the name field
    body('name', 'Design name required')
        .trim()
        .isLength({min: 1})
        .escape(),
    body('descr', 'Description required')
        .trim()
        .isLength({min: 1})
        .escape(),

    // Process request after validation and sanitization
    (req, res, next) => {
        // Extract validation errors from a request
        const errors = validationResult(req);

        // Create Design Object with escaped and trimmed data
        const design = new Design({name: req.body.name, descr: req.body.descr});

        if(!errors.isEmpty()){
            // There are errors, render form again with sanitized values and error msg
            res.render('design_form', {
                title: 'Create Design',
                design,
                errors: errors.array(),
            });
            return;
        }else{
            // Data is valid
            // Check if the Design has already exist.
            Design.findOne({name: req.body.name}).exec((err, found_design) => {
                if(err){
                    return next(err);
                }

                if(found_design){
                    // Design already exists, redirect to it's detail page
                    res.redirect(found_design.url);
                }else{
                    design.save((err) => {
                        if(err){
                            return next(err);
                        }
                        // Design saved, redirect to detail page
                        res.redirect(design.url);
                    });
                }
            });
        }

    }
]

// Display Design Delete form on GET
exports.design_delete_get = (req, res, next) => {
    async.parallel(
        {
            design(callback){
                Design.findById(req.params.id).exec(callback);
            },
            design_drills(callback){
                Drill.find({ design: req.params.id }).exec(callback);
            },
        },
        (err, results) => {
            if(err){
                return next(err);
            }
            if(results.design === null){
                // No Results
                res.redirect('/catalog/designs');
            }

            //Successful, so render
            res.render('design_delete', {
                title: 'Delete Design',
                design: results.design,
                design_drills: results.design_drills,
            });
        }
    );
}

// Handle Design Delete on POST
exports.design_delete_post = (req, res, next) => {
    async.parallel(
        {
            design(callback){
                Design.findById(req.body.designid).exec(callback);
            },
            design_drills(callback){
                Drill.find({design: req.body.designid}).exec(callback);
            },
        },
        (err, results) => {
            if(err){
                return next(err);
            }

            //Success
            if(results.design_drills.length > 0){
                // Design has Drills. Render in the same way as GET route
                res.render('design_delete',{
                    title: 'Delete Design',
                    design: results.design,
                    design_drills: results.design_drills,
                });
                return;
            }

            // Design has no Drills related, Delete object and return the list of designs
            Design.findByIdAndRemove(req.body.designid, (err) => {
                if(err){
                    return next(err);
                }

                // Success, go to Design List
                res.redirect('/catalog/designs');
            })
        }
    );
}

// Display Design Update form on GET
exports.design_update_get = (req, res, next) => {
    Design.findById(req.params.id).exec((err, design) => {
        if(err){
            return next(err);
        }

        if(design == null){
            const err = new Error('Design not found.');
            err.status = 404;
            return next(err);
        }

        res.render('design_form', {
            title: 'Update Design',
            design: design,
        });
    })
}

// Handle Design Update on POST
exports.design_update_post = [
    // Validate and sanitize the name field
    body('name', 'Design name required')
    .trim()
    .isLength({min: 1})
    .escape(),
    body('descr', 'Description required')
    .trim()
    .isLength({min: 1})
    .escape(),

    // Process Request after sanitize and validate
    (req, res, next) => {
        // Extract validation error from request
        const errors = validationResult(req);

        // Create a new Design object with sanitized data
        const design = new Design({
            name: req.body.name,
            descr: req.body.descr,
            _id: req.params.id,
        });

        if(!errors.isEmpty()){
            // there are error, render form again with sanitized data    
            res.render('design_form', {
                title: 'Update Design',
                design: design,
                errors: errors.array(),
            });
            return;
        }

        // data from form is valid. Update the record
        Design.findByIdAndUpdate(req.params.id, design, {}, (err, thedesign) => {
            if(err){
                return next(err);
            }

            // Success, redirect
            res.redirect(thedesign.url);
        });
    }
];