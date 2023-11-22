// app.js
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const categorySelect = document.getElementById('category');
const githubAuthButton = document.getElementById('github-auth-button');

const githubAuthProvider = new firebase.auth.GithubAuthProvider();

githubAuthButton.addEventListener('click', () => {
    firebase.auth().signInWithPopup(githubAuthProvider)
        .then((result) => {
            const user = result.user;
            
            saveUserData(user.uid, {
                category: categorySelect.value,
                githubUsername: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
            });

            alert('User signed in successfully!');
        })
        .catch((error) => {
            console.error(error.message);
            alert('Error signing in with GitHub');
        });
});

function saveUserData(uid, data) {
    firebase.database().ref('users/' + uid).set(data);
}
