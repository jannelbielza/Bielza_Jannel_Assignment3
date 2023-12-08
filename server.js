//----------------------------------------------------------------//

// these wont change
const express = require('express');
const crypto = require('crypto');
const app = express();
const qs = require(`querystring`);
app.use(express.urlencoded({ extended: true }));

//grabs everything from public
app.use(express.static(__dirname + '/public'));

//sets up the product array from the json file
let products = require(__dirname + '/products.json');

// Route all other GET requests to serve static files from a directory named "public"
app.all('*', function (request, response, next) {
    //console.log(request.method + ' to ' + request.path);
    next();
 });

// Start the server; listen on port 8080 for incoming HTTP requests
app.listen(8080, () => console.log(`listening on port 8080`));

// Define a route for handling a GET request to a path that matches "./products.js"
app.get("/products.js", function (request, response, next) {
    response.type('.js');
    let products_str = `var products = ${JSON.stringify(products)};`;
    //console.log(products_str);
    response.send(products_str);
});

//----------------------------------------------------------------//


//---------------------Assignment2---------------------------------//

let user_data;

const fs = require('fs');

const filename= __dirname + '/user_data.json';

// Check if the file exists
if (fs.existsSync(filename)){
    // If the file exists, read its contents
    let data = fs.readFileSync(filename, 'utf8');
    // Parse the JSON data into a JavaScript object
    user_data = JSON.parse(data);
    // Log the user data to the console
    console.log(user_data);
} else {
    // If the file does not exist, log an error message
    console.log(`${filename} does not exist`);
    // Initialize the user_data variable as an empty object
    user_data = {};
}

// Declare a temporary variable to store user inputs
let temp_user = {}; // temp storage for user inputs to be passed along


//----------------------------------------------------------------//// Handle POST request to "/process_form"
app.post("/process_form", function (request, response) {
    // extract content of request's body
    let POST = request.body;
    console.log("Received from data:", POST);
    // assuming input boxes are empty
    let has_qty = false;
    // creating object to store error message for each input
    let errorObject = {};

    // iterating through each input
    for (let i in products) {
        let qty = POST[`qty${[i]}`];
        has_qty = has_qty || (qty > 0);

        let errorMessage = validateQuantity(qty, products[i].quantity_available);

        // store error messages
        if (errorMessage.length > 0) {
            errorObject[`qty${[i]}_error`] = errorMessage.join(', ');
        }
    }

    // if all input boxes are empty with no error
    if (has_qty == false && Object.keys(errorObject).length == 0) {
        // redirect to products_display with error in url
        response.redirect("./products_display.html?error");
    } else if (has_qty == true && Object.keys(errorObject).length == 0) {
        // update quantities and redirect to invoice
        for (let i in products) {
            temp_user[`qty${[i]}`] = POST[`qty${[i]}`];

            console.log(temp_user);

            /*
            // update quantity sold and available
            products[i].qty_sold += Number(qty);
            products[i].qty_available = products[i].qty_available - qty;
            */
        }
        // redirect to invoice page
        let params = new URLSearchParams(temp_user);
        console.log(params);
        response.redirect(`./login.html?${params.toString()}`);
    }
    // If there is an error
    else {
        if (Object.keys(errorObject).length > 0) {
            response.redirect("./products_display.html?" + qs.stringify(POST) + `&inputErr`);
        } else {
            if (has_qty == false) {
                response.redirect("./products_display.html?" + qs.stringify(POST) + `&error`);
            }
        }
    }
});


//function to validate the quantity, returns a string if not a number, negative, not an integer, or a combination of both
//if no errors in quantity, returns empty string
function validateQuantity(quantity, quantity_available) {
    let errorMessages = [];

    let quantityNumber = Number(quantity);

    if (isNaN(quantityNumber)) {
        errorMessages.push("Please Enter a Number");
    } else if (quantityNumber < 0 && !Number.isInteger(quantityNumber)) {
        errorMessages.push("Please Enter a Positive Integer");
    } else if (quantityNumber < 0) {
        errorMessages.push("Please Enter a Positive Value");
    } else if (!Number.isInteger(quantityNumber)) {
        errorMessages.push("Please Enter an Integer");
    } else if (quantityNumber > quantity_available) {
        errorMessages.push("Not Enough Items in Stock!");
    }

    return errorMessages;
}

//-------------------Assignment2------------------------------------//
app.post("/process_login", function(request, response){
    let POST = request.body;
    let entered_email = POST['email'].toLowerCase();
    let entered_password = POST['password'];

    if (entered_email.length == 0 && entered_password.length == 0) {
        request.query.loginErr = 'Email address and password are required';
    } else if (user_data[entered_email]) {
        if (user_data[entered_email].password == entered_password) {
            temp_user['email'] = entered_email;
            temp_user['name'] = user_data[entered_email].name;
    
            let params = new URLSearchParams(temp_user);
            response.redirect(`/invoice.html?valid&${params.toString()}`);
    
            return;
        } else if (entered_password.length == 0) {
            request.query.loginErr = 'Password cannot be blank';
        } else {
            request.query.loginErr = 'Invalid password';
        }
    } else {
        request.query.loginErr = 'Invalid email';
    }
    request.query.email = entered_email;
    let params = new URLSearchParams(request.query);
    response.redirect(`login.html?${params.toString()}`);
});


app.post('/continue_shopping', function(request, response) {
    let params = new URLSearchParams(temp_user);
    response.redirect(`/products_display.html?${params.toString()}`);
});

app.post('/purchase_Logout', function(request, response) {
    for (let i in products) {


        products[i].qty_sold += Number(temp_user[`qty${i}`])
        products[i].quantity_available = products[i].quantity_available - Number(temp_user[`qty${i}`]);
    }
   
    
    fs.writeFile(__dirname + '/products.json', JSON.stringify(products), 'utf-8', (err) => {
        if (err) {
            console.error('Error uploading products data', err);
        } else {
            console.log('Products data uploaded successfully')
        }
    })

    delete temp_user['email'];
    delete temp_user['name'];
    response.redirect('/products_display.html');

});

let registration_errors = {};

app.post("/process_register", function (request, response) {
    let reg_name = request.body.name;
    let reg_email = request.body.email.toLowerCase();
    let reg_password = request.body.password;
    let reg_confirm_password = request.body.confirm_password;

     // Validate Email Address
     let emailValidationResult = validateEmailAddress(reg_email);
     if (emailValidationResult !== "") {
         registration_errors['email_type'] = emailValidationResult;
     }
 
     // Validate Password
     let passwordValidationResult = validatePassword(reg_password);
     if (passwordValidationResult !== "") {
         registration_errors['password_type'] = passwordValidationResult;
     }

    validateConfirmPassword(reg_confirm_password, reg_password);

    if(Object.keys(registration_errors).length == 0) {
        user_data[reg_email] = {};
        user_data[reg_email].name = reg_name;
        user_data[reg_email].password = reg_password;

        fs.writeFile(__dirname + '/user_data.json', JSON.stringify(user_data), 'utf-8', (err) => {
            if (err) {
                console.error('Error updating user data', err);
            }else {
                console.log('User data has been updated successfully');

                temp_user['name'] = reg_name;
                temp_user['email'] = reg_email;

                console.log(temp_user);
                console.log(user_data);

                let params = new URLSearchParams(temp_user);
                response.redirect(`/invoice.html?regSuccess&valid&${params.toString()}`);
            }
        });
    } else {
        delete request.body.password;
        delete request.body.confirm_password;

        let params = new URLSearchParams(request.body);
        response.redirect(`/register.html?${params.toString()}&${qs.stringify(registration_errors)}`)
    }
});


function validateConfirmPassword(confirm_password, password) {

    delete registration_errors['confirm_password_type'];

    console.log(registration_errors);

    if(confirm_password !== password){
        registration_errors['confirm_password_type'] = 'Passwords do not match';
    }
}

// Function to validate email address format
function validateEmailAddress(email) {
    // Regular expression for email validation
    // X@Y.Z where X is letters, numbers, _, or . (at least one character),
    // Y is letters, numbers, or . (at least one character),
    // Z is letters (2 or 3 characters)
    const emailRegex = /^[a-zA-Z0-9_.]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,3}$/;

    // Check if the email matches the expected format
    if (!emailRegex.test(email)) {
        return 'Invalid email address format';
    }

    // Check if the email is unique (not already registered)
    if (user_data[email]) {
        return 'Email address is already in use';
    }

    // Return an empty string if the email is valid
    return '';
}

// Function to validate password criteria
function validatePassword(password) {
    // Check password length (minimum 10, maximum 16 characters)
    if (password.length < 10 || password.length > 16) {
        return 'Password must be between 10 and 16 characters';
    }

    // Check for spaces in the password
    if (password.includes(' ')) {
        return 'Password cannot contain spaces';
    }

    // Return an empty string if the password is valid
    return '';
}

//----------------------------------------------------------------//