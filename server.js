//----------------------------------------------------------------//

// these wont change
const express = require('express');
const session = require('express-session'); // A3
const cookieParser = require('cookie-parser'); //A3
const {request} = require('http'); //A3

const app = express();
const qs = require(`querystring`);
app.use(express.urlencoded({ extended: true }));

//grabs everything from public
app.use(express.static(__dirname + '/public'));

//sets up the product array from the json file
const products = require(__dirname + '/products.json');
for (let category in products) {
    products[category].forEach((prod, i) => {prod.qty_sold});
}

app.use(session({secret: "myNotSoSecretKey", resave: true, saveUninitialized: true})); //A3

app.use(cookieParser()); //A3
// Route all other GET requests to serve static files from a directory named "public"
app.all('*', function (request, response, next) { //A3
    //console.log(request.method + ' to ' + request.path);

    if (typeof request.session.cart == 'undefined'){
        request.session.cart = {};
    }
    if (typeof request.session.users == 'undefined'){
        request.session.users = Object.keys(status).length;
    }
    next();
 });

// Start the server; listen on port 8080 for incoming HTTP requests
app.listen(8080, () => console.log(`listening on port 8080`));

// Define a route for handling a GET request to a path that matches "./products.js"
app.get("/products.js", function (request, response, next) {
    response.type('.js');
    let products_str = `let products = ${JSON.stringify(products)};`;
    //console.log(products_str);
    response.send(products_str);
});

//----------------------------------------------------------------//


//---------------------Assignment2---------------------------------//

let status = {};
let user_data;
const fs = require('fs');
const { response } = require('express');
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


//----------------------------------------------------------------/

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

app.post('/get_cart', function(request, response) {
    response.json(request.session.cart);
});

// Handle the login process
app.post("/process_login", function(request, response){
    // Extract data from the request body
    let POST = request.body;
    let entered_email = POST['email'].toLowerCase();
    let entered_password = POST['password'];

    // Check for empty email and password
    if (entered_email.length == 0 && entered_password.length == 0) {
        request.query.loginErr = 'Email address and password are required';
    } else if (user_data[entered_email]) {
        // Check if the entered password is valid
        if (user_data[entered_email].password == entered_password) {
            if(user_data[entered_email].status == false){
                user_data[entered_email].status =true;

                status[entered_email] = true;
            }
            
            //store the user's email and name in the cookie
            let user_cookie = {"email": entered_email, "name": user_data[entered_email]['name']};
        

            response.cookie('user_cookie', JSON.stringify(user_cookie), {maxAge: 900 * 1000});

            console.log(user_cookie);
            
            fs.writeFile(__dirname + filename, JSON.stringify(user_data), 'utf-8', (err) => { 
                if (err) throw err;
                console.log('User data has been updated!');
            });
            response.redirect(`/cart.html?`);
            return;

        } else if (entered_password.length == 0) {
            request.query.loginErr = 'Password cannot be blank';
        } else {
            request.query.loginErr = 'Invalid password';
        }
    } else {
        request.query.loginErr = 'Invalid email';
    }
    // Redirect to login.html with query parameters
    request.query.email = entered_email;
    let params = new URLSearchParams(request.query);
    response.redirect(`login.html?${params.toString()}`);
});

// Handle user registration
let registration_errors = {};

app.post("/process_register", function (request, response) {
    // Extract registration data from the request body
    let reg_name = request.body.name;
    let reg_email = request.body.email.toLowerCase();
    let reg_password = request.body.password;
    let reg_confirm_password = request.body.confirm_password;

    // Validate and compare confirm password
    validateConfirmPassword(reg_confirm_password, reg_password);

    // Validate email address
    let emailValidationResult = validateEmailAddress(reg_email);
    if (emailValidationResult !== "") {
        registration_errors['email_type'] = emailValidationResult;
    }

    // Validate password
    let passwordValidationResult = validatePassword(reg_password);
    if (passwordValidationResult !== "") {
        registration_errors['password_type'] = passwordValidationResult;
    }

    

    // Check if there are no registration errors
    if (Object.keys(registration_errors).length == 0) {
        // Save user data, clear registration errors, and redirect to invoice.html
        user_data[reg_email] = {
            "name": reg_name,
            "password": reg_password,
            "status": true
        };

        fs.writeFile(__dirname + '/user_data.json', JSON.stringify(user_data), 'utf-8', (err) => {
            if (err) {
                console.error('Error updating user data', err);
            } else {
                console.log('User data has been updated successfully');

                status[reg_email] = true;

                response.redirect(`/login.html`);
            }
        });
    } else {
        // If there are registration errors, redirect to register.html with errors in query parameters
        delete request.body.password;
        delete request.body.confirm_password;

        let params = new URLSearchParams(request.body);
        response.redirect(`/register.html?${params.toString()}&${qs.stringify(registration_errors)}`)
    }
});

// Function to validate confirm password
function validateConfirmPassword(confirm_password, password) {
    delete registration_errors['confirm_password_type'];

    if (confirm_password !== password) {
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

//-----------------------Assignment 3--------------------------//

app.post('/add_to_cart', function (request, response) {
    // POST the content of the request route
	let POST = request.body;

	// Figure out a way to send the products_key from the client-side to the server
	let products_key = POST['products_key'];

	// Create an object to store error messages
	let errorObject = {};

	// Iterate through the products object
	for (let i in products[products_key]) {
		// Retrieve the user's quantity inputs
		let qty = POST[`qty${[i]}`];

        let errorMessages = validateQuantity(qty, products[products_key][i].quantity_available);
        if (errorMessages.length > 0) {
            errorObject[`qty${[i]}_error`] = errorMessages.join(', ');
        }
        console.log('error messages are:' + errorMessages);

		// Validate the inputs
	}
    console.log("errorObject =" + Object.keys(errorObject) + " " + Object.keys(errorObject).length);

	// If there are no input errors
	if (Object.keys(errorObject).length == 0) {
		// If the session cart does not exist
	  if (!request.session.cart) {
	    // Create one
	    request.session.cart = {};
    }

		// If the session cart array for a product category does not exist
		if (typeof request.session.cart[products_key] == 'undefined') {
		  // Create one
		  request.session.cart[products_key] = [];
		}

		// Make an array to store the quantities the users input
		let user_qty = [];

		for (let i in products[products_key]) {
		  // Push the user's inputs into the array
		  user_qty.push(Number(POST[`qty${i}`]));  
		}

		// Set user_qty in the session 
		request.session.cart[products_key] = user_qty;
    
		// Redirect the user to the appropriate page
		response.redirect(`/products_display.html?products_key=#{POST['products_key']}`);
	}
	// If there are input errors
	else if (Object.keys(errorObject).length > 0){
		// Redirect the user to the appropriate page
		response.redirect(`/products_display.html?${qs.stringify(POST)}&inputErr`);
	}
});

app.post('/update_shopping_cart', function (request, response) {
    let POST = request.body;

    let products_key = POST['products_key'];

    for (products_key in request.session.cart) {
        for(let i in request.session.cart[products_key]) {
            request.session.cart[products_key][i] = Number(request.body[`cartInput_${products_key}${i}`]);
        }
    }
    response.redirect('/cart.html');
});

app.post ('/continue', function (request, response) { 
    response.redirect('/products_display.html?');
});

app.post('/checkout', function (request, response) {
    if (typeof request.cookies['user_cookie'] == 'undefined') {
        response.redirect('/login.html');
    } else {
        response.redirect('/invoice.html?valid');
    }
});

app.post('complete_purchase', function (request, response) {
    let cookie = JSON.parse(request.cookies['user_cookie']);
    let email = cookie['email'];

    let subtotal = 0;
    let total = 0;

    let invoice_str =`
        Thank you for your order!
            <tbody>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity Purchased</th>
                        <th>Remaining Inventory</th>
                        <th>Price</th>
                        <th>Extended Price</th>
                    </tr>
                </thead>
            <tbody>

    `;
    let shopping_cart = request.session.cart;

    for (let products_key in products){
        for (let i in products[products_key]){
            if (typeof shopping_cart[products_key] == 'undefined') continue;

            let qty = shopping_cart[products_key][i];

            products[products_key][i].qty_sold += Number(qty);
            products[products_key][i].quantity_available -= Number(qty) || 0;
        }
    }
    fs.writeFile(__dirname + '/products.json', JSON.stringify(products), 'utf-8', (err) => {
        if (err) {
            console.error('error updating products data:', err);
        } else {
            console.log('Products data has been updated successfully');
        }
    });
    for (let products_key in products) { 
        for (let i in products[products_key]) {
            if (typeof shopping_cart[products_key] == 'undefined') continue;

            let qty = shopping_cart[products_key][i];
            if (qty > 0){
                let extended_price = qty * products[products_key][i].price;
                subtotal += extended_price;
                invoice_str += `
                <tr>
                    <td>${products[products_key][i].name}</td>
                    <td>${qty}</td>
                    <td>${products[products_key][i].quantity_available - qty}</td>
                    <td>$${products[products_key][i].price.toFixed(2)}</td>
                    <td>$${extended_price}</td>
                </tr>
                `;
            }
        }
    }
    let tax_rate = (4.7/100);
    let tax_amt = subtotal * tax_rate;

    if (subtotal < 300){
        shipping = 5;
        shipping_display = `$${shipping.toFixed(2)}`;
        total = Number(tax_amt + subtotal + shipping);
    } else if (subtotal >= 300 && subtotal < 500){
        shipping = 10;
        shipping_display = `$${shipping.toFixed(2)}`;
        total = Number(tax_amt + subtotal + shipping);
    } else {
        shipping = 0;
        shipping_display = 'FREE';
        total = Number(tax_amt + subtotal + shipping);
    }
    invoice_str += `
        <tr style="border-top: 2px solid black;">
           <td colspan="4" style="text-align:center;">Sub-total</td>
           <td>$${subtotal.toFixed(2)}</td>
        </tr>
        <tr>
            <td colspan="4" style="text-align:center;"> Tax @ ${Number(tax_rate) * 100}%</td>
            <td> ${tax_amt.toFixed(2)}</td>
        </tr>
        <tr>
            <td colspan="4" style="text-align:center;">Shipping</td>
            <td>${shipping_display}</td>
        </tr>
        <tr>
            <td colspan="4" style="text-align:center;"><b>Total</b></td>
            <td> ${total.toFixed(2)}</td>
        </tr>
        </tbody>
        </>
    `;
    response.session.destroy();
    response.send(invoice_str);
});

app.post('/process_logout', function (request, response) {
    let cookie = JSON.parse(request.cookies['user_cookie']);

    let email = cookie['email'];

    if (user_data[email] && user_data[email].status == true){
        delete status[email];

        user_data[email].status = false;

        response.clearCookie("user_cookie");

        request.session.users = Object.keys(status).length;

        fs.writeFile(filename, JSON.stringify(user_data), 'utf-8', (err) => {
            if (err) {
                console.error('Error updating user data:', err);
            } else {
                console.log ('User data has been updated successfully');
                console.log(user_data);
                console.log(`user with email${email} was successfully logged out`);
                response.redirect('/index.html?');
            }
        });
    } else {
        console.log(user_data);
        console.log(status);
        console.error(`user with email ${email} not found or is already logged out.`);
        response.redirect('/index.html?');
    }
});

