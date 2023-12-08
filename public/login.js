let params = (new URL(document.location)).searchParams;

//when window loads, perform following:
window.onload = function() {
    if (params.has('loginErr')) {
        document.getElementById('errorMessage').innerText = params.get('loginErr');
        
    }
    document.getElementById('email').value = params.get('email');
}




