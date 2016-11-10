<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "myastro";
// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


// This is the directory where images will be saved
    $target = "app/images/";
    $target = $target . basename( $_FILES['background']['name']);

// This gets all the other information from the form
    $title=$_POST['landingTitle'];
    $background=($_FILES['background']['name']);
    $intro=$_POST['landingIntro'];

// Writes the information to the database
    $dbQuery= "INSERT INTO landing (title,background,intro) VALUES ('$title', '$background', '$intro')" ;
    $resQuery = $conn->query($dbQuery);


if ($resQuery === TRUE) {
    echo "New record created successfully";
} else {
    echo "Error: " . $dbQuery . "<br>" . $conn->error;
}
    $conn->close();

// Writes the photo to the server
if(move_uploaded_file($_FILES['background']['tmp_name'], $target))
{

// Tells you if its all ok
    echo "The file ". basename( $_FILES['background']['name']). " has been uploaded, and your information has been added to the directory";
}
else {

// Gives and error if its not
    echo "Sorry, there was a problem uploading your file.";
}


?>