const firebaseConfig = {
     apiKey: "AIzaSyD4hXq4Y7tuvIPzW_GXKkKpHcr3YIIGQ-k",
    authDomain: "maarg-db.firebaseapp.com",
    databaseURL: "https://maarg-db-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "maarg-db",
    storageBucket: "maarg-db.appspot.com",
    messagingSenderId: "1064924430335",
    appId: "1:1064924430335:web:02a4ead937157e06f871ca",
    measurementId: "G-YZFREMVRQX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const usersCollection = database.ref("users");

document.getElementById('phone').addEventListener('blur', generateUserId);
document.getElementById('aadhaar').addEventListener('blur', generateUserId);

function generateUserId() {
    var phone = document.getElementById('phone').value;
    var aadhaar = document.getElementById('aadhaar').value;

    if (phone.length >= 4 && aadhaar.length >= 8) {
        var userId = phone.substring(0, 4) + aadhaar.substring(4, 8);
        document.getElementById('userId').value = userId;
    }
}

document.getElementById('addUserForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    var newUserRef = usersCollection.push(); // Create a reference to a new user document

    newUserRef.set({
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        aadhaar: document.getElementById('aadhaar').value,
        state: document.getElementById('state').value,
        userId: document.getElementById('userId').value
        // other fields...
    })
    .then(() => {
        console.log("New user document created with ID: ", newUserRef.key);

        // Now you can add data to a subcollection of this user document
        newUserRef.child("subcollection").push({
            // your data here
        });
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
});
