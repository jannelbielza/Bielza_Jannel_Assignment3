let params = (new URL(document.location)).searchParams;

window.onload = function() {
    let register_form = document.forms['register_form'];

    register_form.elements['name'].value = params.get('name');
    register_form.elements['email'].value = params.get('email');

    for (let i = 0; i < document.getElementsByClassName('form-group').length; i++) {
        let inputName = register_form.elements[i].name;
    
        if (params.has(`${inputName}_length`)) {
            document.getElementById(`${inputName}_error`).innerHTML = params.get(`${inputName}_length`);
    
            if (params.has(`${inputName}_type`)) {
                document.getElementById(`${inputName}_error`).innerHTML = params.get(`${inputName}_length`) + `<br>` + params.get(`${inputName}_type`);
            }
        } else if (params.has(`${inputName}_type`)) {
            document.getElementById(`${inputName}_error`).innerHTML = params.get(`${inputName}_type`);
        
        }
    }
}    