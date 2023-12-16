// Extract query parameters from the current URL
let params = (new URL(document.location)).searchParams;

// Execute the code when the window has finished loading
window.onload = function() {
    // Get the registration form element by its name attribute
    let register_form = document.forms['register_form'];

    // Populate 'name' and 'email' fields in the form with values from the URL parameters
    register_form.elements['name'].value = params.get('name');
    register_form.elements['email'].value = params.get('email');

    // Loop through form groups with class 'form-group'
    for (let i = 0; i < document.getElementsByClassName('form-group').length; i++) {
        // Get the name attribute of the current form element
        let inputName = 'z'.elements[i].name;

        // Check if there is an error related to the length of the input
        if (params.has(`${inputName}_length`)) {
            // Display the length error message in the corresponding error element
            document.getElementById(`${inputName}_error`).innerHTML = params.get(`${inputName}_length`);

            // Check if there is also a type error for the input
            if (params.has(`${inputName}_type`)) {
                // If both length and type errors exist, display both messages
                document.getElementById(`${inputName}_error`).innerHTML = params.get(`${inputName}_length`) + `<br>` + params.get(`${inputName}_type`);
            }
        } else if (params.has(`${inputName}_type`)) {
            // If there is only a type error, display the type error message
            document.getElementById(`${inputName}_error`).innerHTML = params.get(`${inputName}_type`);
        }
    }
}
