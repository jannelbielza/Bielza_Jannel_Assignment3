// Assuming 'products_key' is defined earlier in your code

for (let i in products[products_key]) {
    document.querySelector('.row').innerHTML += `
        <div class="col-sm-4">
            <div class="card h-100">
                <h4 class="card-title"><b>${products[products_key][i].name}</b></h4>
                <img class="card-img-top" src="${products[products_key][i].image}" alt="Card image">
                <div class="card-body">
                    <p class="card-text">$${(products[products_key][i].price)}</p>
                    <p><b>Available: ${products[products_key][i].quantity_available}</b></p>

                    <button type="button" class="btn btn-secondary" onclick="decrementQuantity(${i})">-</button>

                    <!-- Modified code with inline style for width (e.g., style="width: 50px;") -->
                    <input type="text" placeholder="Enter Quantity" name="qty${i}" id="qty${i}_entered" class="form-control mb-2" style="width: 50px;" oninput="validateQuantity(this.value, ${(products[products_key][i].quantity_available)}, document.getElementById('qty${[i]}_error'))" value="0">

                    <button type="button" class="btn btn-secondary" onclick="incrementQuantity(${i})">+</button>

                    <tr>
                        <td style="text-align: left; width: 35%;" id="qty_sold${i}">Sold: ${products[products_key][i].qty_sold}</td>
                    </tr>

                    <tr>
                        <td colspan="3" style="padding-top: 10px;">
                            <input type="submit" value="Add to cart" class="sm-button highlight">
                        </td>
                    </tr>

                    <td colspan="3" style="padding-top: 5px;"><div id="qty${[i]}_error" style="color: #ff2e2e;"></div></td>
                </div>
            </div>
        </div>`;
}

// Add the footer outside the loop
document.querySelector('.row').innerHTML += `
    <footer class="text-center py-4">
        <div class="row">
            <div class="col">
                <input type="submit" value="Purchase" class="btn btn-secondary">
            </div>
        </div>
    </footer>`;


window.onload = function() {
    let params = new URLSearchParams(window.location.search);
   
    if (params.has('error')) {

        document.getElementById('errMsg').innerHTML = "No quantities selected.";
        setTimeout(() => {
            document.getElementById('errMsg').innerHTML = "";
        }, 4000);
    }

    else if (params.has('inputErr')){
        alert("Input error!");
        document.getElementById('errMsg').innerHTML = "Please fix errors before continuing.";
        setTimeout(() => {
            document.getElementById('errMsg').innerHTML = "";
    }, 4000);

    for (let i in products[products_key]){
        if (params.get(`qty${i}`) == 0){
            productForm[`qty${i}`].value = '';
        } else {
            productForm[`qty${i}`].value = params.get(`qty${i}`);
            productForm[`qty${i}`].parentElement.style.borderColor = "red";
        }
        errors = validateQuantity(params.get(`qty${i}`), products[products_key][i].quantity_available);
        document.getElementById(`qty${i}_error`).innerHTML = errors.join('');
        alert(errors);
    }
    }
    if ((typeof shopping_cart[products_key] != 'undefined') && (params.has('inputErr') != true)) {
        for (let i in shopping_cart[products_key]){
            if(shopping_cart[products_key][i] == 0){
                document.getElementById(`qty${[i]}`).value - '';
            }else {
                document.getElementById(`qty${[i]}`).value = shopping_cart[products_key][i];
            }
        }
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
