- form [username, password, email] - done
- button [ submit] - done
- event: onclick button -> backend api -> request <- response from backend
- logic or view in backend to send out request

Here's how to approach the "event" task in your RegisterForm.tsx component:

- Add State for Form Inputs: You need to use React's useState hook to manage the values the user types into each input field (username, email, password, password2).
- Add onChange Handlers: Attach onChange event handlers to each input field. These handlers will update the corresponding state variable every time the user types.
- Add an onSubmit Handler to the <form>: Create an asynchronous function (async handleSubmit(event) { ... }) that will be called when the form is submitted. Attach this function to the <form> element using the onSubmit prop.
- Inside the onSubmit Handler:
- Prevent Default: Call event.preventDefault(); at the beginning to stop the browser from doing a standard form submission and refreshing the page.
- Get Values: Access the current values from your state variables.
- (Optional MVP Client Validation): Add basic checks here if you want (e.g., if (!username || !password) { alert('Fields are required'); return; }). No need for Zod yet.
- Prepare Data: Create a JavaScript object with the form data in the exact JSON format expected by your backend registration API endpoint (/dj-rest-auth/registration/). (Based on your log, this is likely { username, email, password: password1, password2 }).
- Make the API Call: Use axios.post or Workspace('http://localhost:8000/dj-rest-auth/registration/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yourData) }).
- Handle the Response:
- Use .then() and .catch() (or try...catch with async/await) to handle the promise returned by the API call.
- If the response is successful (check the status code, e.g., 200 or 201), it means the user was registered. You can show a success message or redirect the user (e.g., router.push('/login')).
- If the response is an error (e.g., status 400 for validation errors), extract the error messages from the JSON response body returned by dj-rest-auth and display them to the user in your form UI.

## Commit messages:
- [ ]  Display authentic status in UI (Globally)
