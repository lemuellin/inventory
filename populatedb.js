#! /usr/bin/env node

console.log('This script populates some test drills, designs, and records to database.');

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const async = require('async')
const Drill = require('./models/drill')
const Design = require('./models/design')
const Record = require('./models/record')


const mongoose = require('mongoose');
mongoose.set('strictQuery', false); // Prepare for Mongoose 7

const mongoDB = userArgs[0];

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

const drills = [];
const designs = [];
const records = [];

function drillCreate(part_num, design, descr, cb){
    drillDetail = {
        part_num: part_num,
        design: design,
    }
    if(descr != false) drillDetail.descr = descr;

    const drill = new Drill(drillDetail);
    drill.save(function(err){
        if(err){
            cb(err, null);
            return;
        }
        console.log('New Drill: ' + drill);
        drills.push(drill);
        cb(null, drill);
    })
}

function designCreate(name, descr, cb){
    const design = new Design({name: name, descr: descr});
    design.save(function(err){
        if(err){
            cb(err, null);
            return;
        }
        console.log('New Design:' + design);
        designs.push(design);
        cb(null, design);
    });
}

function recordCreate(drill, amount, location, descr, cb){
    recordDetail = {
        drill: drill,
        amount: amount,
        location: location,
    }
    if(descr != false) recordDetail.descr = descr;

    const record = new Record(recordDetail);
    record.save(function(err){
        if(err){
            cb(err, null);
            return;
        }
        console.log('New Record: ' + record);
        records.push(record);
        cb(null, drill);
    });
}

function createDesigns(cb){
    async.series([
        function(callback) {
            designCreate('UCY1', 'Drill Standard UCY1', callback);
        },
        function(callback){
            designCreate('MDBT', 'Drill Standard MDBT', callback);
        },
        function(callback){
            designCreate('RDX', 'Drill Standard RDX', callback);
        },
        function(callback){
            designCreate('RDXT', 'Drill RDX T-Point', callback);
        },
        function(callback){
            designCreate('CXDP', 'Router CXDP', callback);
        },
        function(callback){
            designCreate('ET2F', 'Endmill ET2F', callback);
        },
    ], 
    // optional callback
    cb);
}

function createDrills(cb){
    async.series([
        function(callback){
            drillCreate('D0098UCY1098', designs[0], '0.25 x 2.5MM', callback);
        },
        function(callback){
            drillCreate('D0059UCY1197', designs[0], '0.15 x 5MM', callback);
        },
        function(callback){
            drillCreate('D0620MDBT472', designs[1], '1.5 x 12MM', callback);
        },
        function(callback){
            drillCreate('D1250RDX472', designs[2], '3.175 x 12MM', callback);
        },
        function(callback){
            drillCreate('D1250RDXT472', designs[3], 'T-Point 3.175 x 12MM', callback);
        },
        function(callback){
            drillCreate('R0630CXDP472', designs[4], '1.6 x 12MM', callback);
        },
        function(callback){
            drillCreate('R0787CXDP472', designs[4], '2.0 x 12MM', callback);
        },
        function(callback){
            drillCreate('E0630ET2F472', designs[5], '1.6 x 12MM', callback);
        },
        function(callback){
            drillCreate('E0787ET2F472', designs[5], '2.0 x 12MM', callback);
        },
    ],
    // optional callback
    cb);
}

function createRecords(cb){
    async.parallel([
        function(callback){
            recordCreate(drills[0], 250, 'Warehouse', 'App28800, Lot# KN0098233N, received on 2/23/2023', callback);
        },
        function(callback){
            recordCreate(drills[0], 10000, 'Warehouse', 'send to Lemuel for evaluation', callback);
        },
        function(callback){
            recordCreate(drills[1], 10, 'Warehouse', 'check diameter', callback);
        },
        function(callback){
            recordCreate(drills[2], 0, 'Tech Center', 'take top and side view photos', callback);
        },
        function(callback){
            recordCreate(drills[3], 123, 'Warehouse', 'Lot# CN29138213N', callback);
        },
        function(callback){
            recordCreate(drills[3], 99, 'Tech Center', 'Used Drills from App#27900', callback);
        },
        function(callback){
            recordCreate(drills[3], 65, 'Warehouse', 'send to Repoint', callback);
        },
        function(callback){
            recordCreate(drills[4], 100, 'Warehouse', 'send to Lemuel for evaluation', callback);
        },
        function(callback){
            recordCreate(drills[5], 400, 'Tech Center', 'send to Lemuel for evaluation', callback);
        },
        function(callback){
            recordCreate(drills[6], 80, 'Tech Center', 'Repointed', callback);
        },
        function(callback){
            recordCreate(drills[7], 770, 'Warehouse', 'For customer ABC', callback);
        },
        function(callback){
            recordCreate(drills[7], 60, 'Tech Center', 'order more from Taiwan', callback);
        },
    ], 
    // optional callback
    cb);
}


async.series([
        createDesigns,
        createDrills,
        createRecords
    ],
    // Optional callback
    function(err, results) {
        if (err) {
            console.log('FINAL ERR: ' + err);
        }
        else {
            console.log('Records: ' + records);
            
        }
        // All done, disconnect from database
        mongoose.connection.close();
    }
);