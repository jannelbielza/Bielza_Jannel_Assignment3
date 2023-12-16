if (getCookie('user_cookie') != false){
    user_cookie = getCookie('user_cookie');

    document.getElementById('vertify').innerHTML = `
        <h1> Hi ${user_cookie['name']}! </h1>
        <p> Are you sure you want to leave? </p>
    `;

    document.getElementById('logout_button').addEventListener('click', function(){
        document.cookie = 'user_cookie= expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        location.href = './login.html';
    });
} else{
    location.href = './login.html';
    window.stop;
}