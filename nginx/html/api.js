const url = process.env.API_ENDPOINT || 'http://xclbr-api:3000/api/v1/users';
function callApi() {
  fetch(url)
    .then((response) => response.text())
    .then((result) => {
      const resultDiv = document.createElement('div');
      resultDiv.textContent = result;
      document.body.appendChild(resultDiv);
    })
    .catch((error) => console.error('Error:', error));
}

const button = document.createElement('button');
button.textContent = 'Call API';
button.onclick = callApi;
document.body.appendChild(button);