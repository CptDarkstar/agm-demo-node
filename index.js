const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 8383;
const { initializeApp } = require("firebase-admin/app");

const isLive = true;

// import firebase-admin package
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = require(isLive
  ? "/etc/secrets/Google-API.json"
  : "./rns-agm-service.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware setup
app.use(cors());
app.use(express.json());

// Endpoint to create a new Firebase Authentication user
app.post("/createUser", async (req, res) => {
  try {
    const userData = req.body;

    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser(userData);

    // Create user document in Firestore
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      displayName: userData.displayName,
      agency: userData.agency,
      email: userData.email,
      shares: userData.shares,
      votes: [],
      // Add any other user data you want to store
    });

    console.log("Successfully created new user:", userRecord.uid);
    res.send("Successfully created new user");
  } catch (error) {
    console.error("Error creating new user:", error);
    res.status(500).send("Error creating new user");
  }
});

// Endpoint to update an existing Firebase Authentication user
app.put("/updateUser/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const userData = req.body;

    // Update user in Firebase Authentication
    const userRecord = await admin.auth().updateUser(uid, userData);

    // Update user document in Firestore
    await admin.firestore().collection("users").doc(uid).update(userData);

    console.log("Successfully updated user:", userRecord.uid);
    res.send("Successfully updated user");
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Error updating user");
  }
});

// Endpoint to delete an existing Firebase Authentication user
app.delete("/deleteUser/:uid", async (req, res) => {
  const uid = req.params.uid;
  try {
    // Delete user from Firebase Authentication
    await admin.auth().deleteUser(uid);

    // Delete user document from Firestore
    await admin.firestore().collection("users").doc(uid).delete();

    console.log("Successfully deleted user and user document");
    res.send("Successfully deleted user and user document");
  } catch (error) {
    console.error("Error deleting user and user document:", error);
    res.status(500).send("Error deleting user and user document");
  }
});

// Endpoint to set custom claims
app.post("/setCustomClaims/:uid", async (req, res) => {
  const uid = req.params.uid;
  try {
    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    console.log("Successfully set custom claims for user:", uid);
    res.send("Successfully set custom claims");
  } catch (error) {
    console.error("Error setting custom claims:", error);
    res.status(500).send("Error setting custom claims");
  }
});

// Endpoint to disable an user
app.post("/disableUser/:uid", async (req, res) => {
  const uid = req.params.uid;
  try {
    // Disable user
    await admin.auth().updateUser(uid, { disabled: true });

    console.log("Successfully disabled user:", uid);
    res.send("Successfully disabled user");
  } catch (error) {
    console.error("Error disabling user:", error);
    res.status(500).send("Error disabling user");
  }
});

// Endpoint to enable an user
app.post("/enableUser/:uid", async (req, res) => {
  const uid = req.params.uid;
  try {
    // Enable user
    await admin.auth().updateUser(uid, { disabled: false });
    console.log("Successfully enabled user:", uid);
    res.send("Successfully enabled user");
  } catch (error) {
    console.error("Error enabling user:", error);
    res.status(500).send("Error enabling user");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at ${port}`);
});