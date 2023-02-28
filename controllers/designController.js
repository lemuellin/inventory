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
exports.design_delete_get = (req, res) => {
    res.send("NOT IMPLEMENTED: Design Delete GET");
}

// Handle Design Delete on POST
exports.design_delete_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Design Delete POST");
}

// Display Design Update form on GET
exports.design_update_get = (req, res) => {
    res.send("NOT IMPLEMENTED: Design update GET");
}

// Handle Design Update on POST
exports.design_update_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Design update POST");
}