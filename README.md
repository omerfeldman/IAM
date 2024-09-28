# IAM Service with 2FA using TOTP

This README provides instructions for setting up and using our Identity and Access Management (IAM) service, which incorporates Two-Factor Authentication (2FA) using Time-based One-Time Passwords (TOTP). This service ensures enhanced security for user authentication processes.

## Installation

1. Clone the Repository: First, clone the repository to your local machine using your preferred method 

2. Install Dependencies: Navigate to the cloned directory and run the following command to install all necessary dependencies:

```bash
npm install
```

## Run
1. Start the Application: In the project directory, you can run:

```bash
npm run start

```
 This starts the IAM service on your local machine.

2. WebUI Component Update: For the web interface, you need to change the import statement in your local WebUI. Replace the old login component import from 0ld_login.jsx with the new login.jsx component at app.jsx. This step is crucial for the new 2FA feature to work correctly.

## Setting Up 2FA
1. Download Google Authenticator: It's recommended to download the Google Authenticator app on your mobile device. This app will generate your TOTP codes.
2. Configure 2FA: Each user (identified by organization ID and email) must configure 2FA in their account settings. This process will involve scanning a QR code or entering a setup key into the Google Authenticator app.
3. Logging In: Upon logging in, users will be required to enter both their password and the TOTP code displayed in the Google Authenticator app. This ensures an extra layer of security.

## Note on Device Restrictions

Single Device Access: For security reasons, each user's TOTP codes are valid for use on a single mobile device only. Ensure that the device used for setting up 2FA is the one regularly used for accessing the service.
