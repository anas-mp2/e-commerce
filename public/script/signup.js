
//    const nameid = document.getElementById('name');
//     const emailid = document.getElementById('email');
//     const passwordid = document.getElementById('password');
//     const cpasswordid = document.getElementById('cpassword');
//     const error1 = document.getElementById('error1');
//     const error2 = document.getElementById('error2');
//     const error3 = document.getElementById('error3');
//     const error4 = document.getElementById('error4');
//     const signupform = document.getElementById('signupform');

//     function nameValidateChecking() {
//         const nameVal = nameid.value.trim();
//         const namePattern = /^[A-Za-z\s]+$/;

//         if (nameVal === "") {
//             error1.style.display = "block";
//             error1.innerHTML = "Please enter a valid Name";
//             return false;
//         } else if (!namePattern.test(nameVal)) {
//             error1.style.display = "block";
//             error1.innerHTML = "Name should contain only letters and spaces";
//             return false;
//         } else {
//             error1.style.display = "none";
//             error1.innerHTML = "";
//             return true;
//         }
//     }

//     function emailValidateChecking() {
//         const emailval = emailid.value.trim();
//         const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

//         if (!emailPattern.test(emailval)) {
//             error2.style.display = "block";
//             error2.innerHTML = "Invalid email format";
//             return false;
//         } else {
//             error2.style.display = "none";
//             error2.innerHTML = "";
//             return true;
//         }
//     }

//     function passValidateChecking() {
//         const passval = passwordid.value.trim();
//         const cpassval = cpasswordid.value.trim();
//         const alpha = /[A-Za-z]/;
//         const digit = /\d/;

//         if (passval.length < 8) {
//             error3.style.display = "block";
//             error3.innerHTML = "Password should contain at least 8 characters";
//             return false;
//         } else if (!alpha.test(passval) || !digit.test(passval)) {
//             error3.style.display = "block";
//             error3.innerHTML = "Password should contain both letters and numbers";
//             return false;
//         } else {
//             error3.style.display = "none";
//             error3.innerHTML = "";
//         }

//         if (passval !== cpassval) {
//             error4.style.display = "block";
//             error4.innerHTML = "Passwords do not match";
//             return false;
//         } else {
//             error4.style.display = "none";
//             error4.innerHTML = "";
//         }
//         return true;
//     }

//     document.addEventListener('DOMContentLoaded', function () {
//         signupform.addEventListener("submit", function (e) {
//             // Run all validations
//             const isNameValid = nameValidateChecking();
//             const isEmailValid = emailValidateChecking();
//             const isPasswordValid = passValidateChecking();

//             // If any validation fails, prevent form submission
//             if (!isNameValid || !isEmailValid || !isPasswordValid) {
//                 e.preventDefault();
//             }
//         });
//     });


//     document.getElementById("googleAuthBtn").addEventListener("click", function (event) {
//         event.preventDefault(); // Prevent form validation from triggering
//         window.location.href = "/auth/google";
//     });
const nameid = document.getElementById('name');
const emailid = document.getElementById('email');
const passwordid = document.getElementById('password');
const cpasswordid = document.getElementById('cpassword');
const error1 = document.getElementById('error1');
const error2 = document.getElementById('error2');
const error3 = document.getElementById('error3');
const error4 = document.getElementById('error4');
const signupform = document.getElementById('signupform');

function nameValidateChecking() {
    const nameVal = nameid.value.trim();
    const namePattern = /^[A-Za-z\s]+$/;

    if (nameVal === "") {
        error1.style.display = "block";
        error1.innerHTML = "Please enter a valid Name";
        return false;
    } else if (!namePattern.test(nameVal)) {
        error1.style.display = "block";
        error1.innerHTML = "Name should contain only letters and spaces";
        return false;
    } else {
        error1.style.display = "none";
        error1.innerHTML = "";
        return true;
    }
}

function emailValidateChecking() {
    const emailval = emailid.value.trim();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!emailPattern.test(emailval)) {
        error2.style.display = "block";
        error2.innerHTML = "Invalid email format";
        return false;
    } else {
        error2.style.display = "none";
        error2.innerHTML = "";
        return true;
    }
}

function passValidateChecking() {
    const passval = passwordid.value.trim();
    const cpassval = cpasswordid.value.trim();
    const alpha = /[A-Za-z]/;
    const digit = /\d/;

    if (passval.length < 8) {
        error3.style.display = "block";
        error3.innerHTML = "Password should contain at least 8 characters";
        return false;
    } else if (!alpha.test(passval) || !digit.test(passval)) {
        error3.style.display = "block";
        error3.innerHTML = "Password should contain both letters and numbers";
        return false;
    } else {
        error3.style.display = "none";
        error3.innerHTML = "";
    }

    if (passval !== cpassval) {
        error4.style.display = "block";
        error4.innerHTML = "Passwords do not match";
        return false;
    } else {
        error4.style.display = "none";
        error4.innerHTML = "";
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function () {
    signupform.addEventListener("submit", function (e) {
        const isNameValid = nameValidateChecking();
        const isEmailValid = emailValidateChecking();
        const isPasswordValid = passValidateChecking();

        if (!isNameValid || !isEmailValid || !isPasswordValid) {
            e.preventDefault();
        }
    });

    document.getElementById("googleAuthBtn").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "/auth/google";
    });
});