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

    var phone = document.getElementById('phone').value;
    var aadhaar = document.getElementById('aadhaar').value;
    var name = document.getElementById('name').value;
    if (phone.length !== 10) {
        alert('Phone number must be exactly 10 digits.');
        return;
    }

    // Check if Aadhaar number is exactly 12 digits
    if (aadhaar.length !== 12) {
        alert('Aadhaar number must be exactly 12 digits.');
        return;
    }

    // Check if name contains only alphabetic characters
    if (!/^[a-zA-Z\s]+$/.test(name)) {
        alert('Name must contain only alphabetic characters.');
        return;
    }
    // Check if a user with the same phone number or Aadhaar card already exists
    usersCollection.orderByChild('phone').equalTo(phone).once('value', function(snapshot) {
        if (snapshot.exists()) {
            alert('A user with this phone number already exists.');
            return;
        }

        usersCollection.orderByChild('aadhaar').equalTo(aadhaar).once('value', function(snapshot) {
            if (snapshot.exists()) {
                alert('A user with this Aadhaar card already exists.');
                return;
            }

            // If no duplicate user is found, create a new user
            var newUserRef = usersCollection.push(); // Create a reference to a new user document

            newUserRef.set({
                name: document.getElementById('name').value,
                phone: phone,
                aadhaar: aadhaar,
                state: document.getElementById('state').value,
                userId: document.getElementById('userId').value
                // other fields...
            })
            .then(() => {
                console.log("New user document created with ID: ", newUserRef.key);

                // Display a success message
                var messageDiv = document.createElement('div');
                messageDiv.textContent = 'User created successfully!';
                document.body.appendChild(messageDiv);

                // Now you can add data to a subcollection of this user document
                newUserRef.child("subcollection").push({
                    // your data here
                });
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
        });
    });
});
document.getElementById('searchBtn').addEventListener('click', function() {
    var searchValue = document.getElementById('search').value;
    searchUsers(searchValue);
});

function searchUsers(searchValue) {
    // Search by each parameter
    var parameters = ['name', 'phone', 'aadhaar', 'userId'];
    var resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = ''; // Clear previous search results

    // Create a table to display the search results
    var resultsTable = document.createElement('table');
    var thead = document.createElement('thead');
    var tbody = document.createElement('tbody');
    var tr = document.createElement('tr');

    // Add table headers
    parameters.concat('Actions').forEach(function(parameter) {
        var th = document.createElement('th');
        th.textContent = parameter;
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    resultsTable.appendChild(thead);

    var userFound = false; // Flag to check if any user is found

    parameters.forEach(function(parameter) {
        usersCollection.orderByChild(parameter).equalTo(searchValue).once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                userFound = true; // Set the flag to true as user is found
                var childData = childSnapshot.val();
                var tr = document.createElement('tr');
                parameters.forEach(function(parameter) {
                    var td = document.createElement('td');
                    td.textContent = childData[parameter];
                    tr.appendChild(td);
                });

                // Add a delete button to the row
                var deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', function() {
                    deleteUser(childSnapshot.key);
                });
                var td = document.createElement('td');
                td.appendChild(deleteButton);
                tr.appendChild(td);

                tbody.appendChild(tr);
            });
        });
    });

    resultsTable.appendChild(tbody);
    resultsDiv.appendChild(resultsTable);

    // If no user is found, display a message
    if (!userFound) {
        var messageDiv = document.createElement('div');
        messageDiv.textContent = 'Oops! No user exists with these details!';
        resultsDiv.appendChild(messageDiv);
    }
}

function deleteUser(userId) {
    // Display a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');
    if (confirmation) {
        usersCollection.child(userId).remove()
        .then(function() {
            console.log("User deleted successfully.");

            // Display a success message
            var messageDiv = document.createElement('div');
            messageDiv.textContent = 'User deleted successfully!';
            document.body.appendChild(messageDiv);
        })
        .catch(function(error) {
            console.error("Error deleting user: ", error);
        });
    }
}
// Map each state to an array of its cities
var citiesByState = {
    "Andaman and Nicobar Islands": ["Port Blair"],
    "Andhra Pradesh": ["Adoni", "Amaravati", "Anantapur", "Chandragiri", "Chittoor", "Dowlaiswaram", "Eluru", "Guntur", "Kadapa", "Kakinada", "Kurnool", "Machilipatnam", "Nagarjunakoṇḍa", "Rajahmundry", "Srikakulam", "Tirupati", "Vijayawada", "Visakhapatnam", "Vizianagaram", "Yemmiganur"],
    "Uttar Pradesh": ["Agra", "Aligarh", "Amroha", "Ayodhya", "Azamgarh", "Bahraich", "Ballia", "Banda", "Bara Banki", "Bareilly", "Basti", "Bijnor", "Bithur", "Budaun", "Bulandshahr", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad-cum-Fatehgarh", "Fatehpur", "Fatehpur Sikri", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur", "Lakhimpur", "Lalitpur", "Lucknow", "Mainpuri", "Mathura", "Meerut", "Mirzapur-Vindhyachal", "Moradabad", "Muzaffarnagar", "Partapgarh", "Pilibhit", "Prayagraj", "Rae Bareli", "Rampur", "Saharanpur", "Sambhal", "Shahjahanpur", "Sitapur", "Sultanpur", "Tehri", "Varanasi"],
    "Uttarakhand": ["Almora", "Dehradun", "Haridwar", "Mussoorie", "Nainital", "Pithoragarh", "Rishikesh", "Roorkee", "Srinagar", "Uttarkashi"],
    "West Bengal": ["Alipore", "Alipurduar", "Asansol", "Baharampur", "Bally", "Balurghat", "Bankura", "Baranagar", "Barasat", "Barrackpore", "Basirhat", "Bhatpara", "Bishnupur", "Budge Budge", "Burdwan", "Chandernagore", "Darjeeling", "Diamond Harbour", "Dum Dum", "Durgapur", "Halisahar", "Haora", "Hugli-Chinsurah", "Ingraj Bazar", "Jalpaiguri", "Kalimpong", "Kamarhati", "Kanchrapara", "Kharagpur", "Koch Bihar", "Kolkata", "Krishnanagar", "Malda", "Midnapore", "Murshidabad", "Navadwip", "Palashi", "Panihati", "Purulia", "Raiganj", "Santipur", "Shantiniketan", "Shrirampur", "Siliguri", "Siuri", "Tamluk"],
    "Telangana": ["Hyderabad", "Karimnagar", "Khammam", "Mahbubnagar", "Nizamabad", "Sangareddi", "Warangal"],
    "Tripura": ["Agartala", "Belonia", "Dharmanagar", "Kailasahar", "Khowai", "Pratapgarh", "Udaipur"],
    "Tamil Nadu": ["Arcot", "Chengalpattu", "Chennai", "Chidambaram", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanniyakumari", "Kodaikanal", "Kumbakonam", "Madurai", "Mamallapuram", "Nagappattinam", "Nagercoil", "Palayankottai", "Pudukkottai", "Rajapalaiyam", "Ramanathapuram", "Salem", "Thanjavur", "Tiruchchirappalli", "Tirunelveli", "Tiruppur", "Tuticorin", "Udhagamandalam", "Vellore"],
    "Sikkim": ["Gangtok"],
    "Rajasthan": ["Abu", "Ajmer", "Alwar", "Amer", "Barmer", "Beawar", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittaurgarh", "Churu", "Dhaulpur", "Dungarpur", "Ganganagar", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalor", "Jhalawar", "Jhunjhunu", "Jodhpur", "Kishangarh", "Kota", "Merta", "Nagaur", "Nathdwara", "Pali", "Phalodi", "Pushkar", "Sawai Madhopur", "Shahpura", "Sikar", "Sirohi", "Tonk", "Udaipur"],
    "Punjab": ["Amritsar", "Batala", "Chandigarh", "Faridkot", "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Nabha", "Patiala", "Rupnagar", "Sangrur", "Tarn Taran Sahib"],
    "Puducherry": ["Karaikal", "Mahe", "Pondicherry", "Yanam"],
    "Odisha": ["Balangir", "Baleshwar", "Baripada", "Bhubaneshwar", "Brahmapur", "Cuttack", "Dhenkanal", "Keonjhar", "Konark", "Koraput", "Paradip", "Phulabani", "Puri", "Sambalpur"],
    "Nagaland": ["Kohima", "Mokokchung", "Mon", "Phek", "Wokha", "Zunheboto"],
    "Mizoram": ["Aizawl", "Lunglei", "Saiha"],
    "Meghalaya": ["Cherrapunji", "Shillong", "Mawlai"],
};

// Get a reference to the state and city dropdowns
var stateDropdown = document.getElementById('state');
var cityDropdown = document.getElementById('city');

// Populate the state dropdown
for (var state in citiesByState) {
    var option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateDropdown.appendChild(option);
}

// Create a function to populate the city dropdown
function populateCityDropdown() {
    var selectedState = stateDropdown.value;
    var cities = citiesByState[selectedState];

    // Clear the city dropdown
    cityDropdown.innerHTML = '';

    // Add an option for each city
    cities.forEach(function(city) {
        var option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityDropdown.appendChild(option);
    });
}

// Call the function to populate the city dropdown when the selected state changes
stateDropdown.addEventListener('change', populateCityDropdown);

// Call the function on page load to populate the city dropdown with the cities of the initially selected state
populateCityDropdown();