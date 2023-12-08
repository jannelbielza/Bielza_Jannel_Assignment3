let params = new URLSearchParams(window.location.search);

window.onload = function() {
    

    if (params.has('error')) {

        document.getElementById('errMsg').innerHTML = "No quantities selected.";
        setTimeout(() => {
            document.getElementById('errMsg').innerHTML = "";
        }, 2000);
    }

    else if (params.has('inputErr')){
        document.getElementById('errMsg').innerHTML = "Please fix errors before continuing.";
        setTimeout(() => {
            document.getElementById('errMsg').innerHTML = "";
    }, 2000);

    for (let i in products){
        let qtyInput = productForm[`qty${[i]}_entered`];
        let qtyError = document.getElementById(`qty${[i]}_error`);

        if (params.get (`qty${i}`) != null){
            qtyInput.value = params.get(`qty${i}`);
        }

        let errorMessages = validateQuantity(qtyInput.value, products[i].quantity_available);
        if (errorMessages.length >0){
            qtyError.innerHTML = errorMessages.join('<br>');
            qtyInput.parentElement.style.borderColor = "red";
        } else {
            qtyError.innerHTML = "";
            qtyInput.parentElement.style.borderColor = "black";
        }
    }
    if (params.has('name')) {
        document.getElementById('helloMsg').innerHTML = `Thank you ${params.get('name')}!`;
        for (let i in products) {
            productForm[`qty${i}`].value = params.get(`qty${i}`);
        }
    }
}

    const form = document.getElementById('productForm');
    let formHTML = '';

    for (let i in products) {
        if (i % 3 === 0) {
            // Start a new row for every index that's a multiple of 3
            formHTML += '<div class="container mt-4"><div class="row">';
        }

        formHTML += `
            <div class="col-sm-4">
                <div class="card h-100">
                    <img class="card-img-top" src="${products[i]["image"]}" alt="Card image">
                    <div class="card-body">
                        <h4 class="card-title">${products[i]["name"]}</h4>
                        <p class="card-text">\$${products[i]["price"].toFixed(2)}</p>
                        <p> ${products[i]["quantity_available"]} in stock!</p>

                        <p>(${products[i]["qty_sold"]} sold)</p>
                        

                        <input type="text" placeholder="Enter Quantity" name="qty${i}" id="qty${i}_entered" class="form-control mb-2" oninput="validateQuantity(this.value, ${products[i].quantity_available}, document.getElementById('qty${[i]}_error'))" value="0">


                      


                        <p id="qty${[i]}_error" class="text-danger qtyError"></p>
                        
                        <div class="d-flex justify-content-between">
                            <button type="button" class="btn btn-secondary" onclick="incrementQuantity(${i})">+</button>
                            <button type="button" class="btn btn-secondary" onclick="decrementQuantity(${i})">-</button>
                        </div>
                    </div>
                </div>
            </div>`;

        if (i % 3 === 2 || i == products.length - 1) {
            // End the row for every third index or the last item
            formHTML += '</div></div>';
        }
    }

    formHTML += `
        <footer class="text-center py-4">
            <div class="row">
                <div class="col">
                    <input type="submit" value="Purchase" class="btn btn-secondary">
                </div>
            </div>
        </footer>`;

    // Push the form content to the DOM
    form.innerHTML = formHTML;

    for (let i in products) {
        validateQuantity(document.getElementById(`qty${i}_entered`).value, products[i].quantity_available);
    }
}

// Function to validate quantity
function validateQuantity(quantity, quantity_available, errorElement) {
    let errors = []; // Initialize an array to hold error messages

    quantity = Number(quantity);

    switch (true) {
        case (isNaN(quantity)) && (quantity !== ''):
            errors.push("Not a number. Please enter a non-negative quantity to order.");
            break;
        case quantity < 0 && !Number.isInteger(quantity):
            errors.push("Negative inventory and not an Integer. Please enter a non-negative quantity to order.");
            break;
        case quantity < 0:
            errors.push("Negative inventory. Please enter a non-negative quantity to order.");
            break;
        case quantity !== 0 && !Number.isInteger(quantity):
            errors.push("Not an Integer. Please enter a non-negative quantity to order.");
            break;
        case quantity > quantity_available:
            errors.push(`We do not have ${quantity} available.`);
            break;
        // No default case needed as no errors mean the array remains empty
    }

    if (errorElement) {
        errorElement.innerHTML = errors.join('<br>');
    }

    // Return true if there are no errors, and false otherwise
    return errors.length === 0;
}

// Increment quantity
function incrementQuantity(index) {
    let quantityTextbox = document.getElementById(`qty${index}_entered`);
    let currentQuantity = parseInt(quantityTextbox.value) || 0;
    quantityTextbox.value = currentQuantity + 1;
    validateQuantity(quantityTextbox.value, products[index].quantity_available, document.getElementById(`qty${index}_error`));
}

// Decrement quantity
function decrementQuantity(index) {
    let quantityTextbox = document.getElementById(`qty${index}_entered`);
    let currentQuantity = parseInt(quantityTextbox.value) || 0;
    let newQuantity = Math.max(currentQuantity - 1); // Ensure the new quantity is not negative
    quantityTextbox.value = newQuantity;
    validateQuantity(quantityTextbox.value, products[index].quantity_available, document.getElementById(`qty${index}_error`));
}
