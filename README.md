# Inventory App
An inventory app that manages products for my current drill company.
[Live Demo](tct-tc-inventory.up.railway.app) :point_left:

<img src="/public/images/demo.gif">

# Features
- Utilized MVC pattern alongside Pug templates, MongoDB schemas, and route controllers
- Sanitized and validated user input by Express-Validator 
- Managed user data through MongoDB in conjunction with Mongoose ODM
- Secured sensitive data with dotenv
- Users are allowed to perform CRUD on all data in the following three Models: Drill, Designs, Record.

1. Drill
    This is the main product of the company, it has 3 fields:
        Part Number
        Design : the 2nd Model
        Description

2. Design
    This is the design of the tool. Each tool has only 1 design. This category contains 2 fields:
        Design Name
        Description

3. Record
    This is the record of each batch of drills, it includes 4 fields:
        Drill: related to the 1st Model
        Amount of drills in stock
        Location: (White Shelf, Warehouse, Office, Tech Center)
        Description: (App#, Lot#, Date, Used? / Repointed? ...)

# Technologies
- Express
- NodeJS
- MongoDB
- Mongoose
- Bootstrap
- Pug

## Getting Started
##### Install and Run
```
git clone https://git@github.com:lemuellin/inventory.git
cd inventory
npm install
npm start
```