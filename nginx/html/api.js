function callApi() {
  const url = document.getElementById('url').value;
  console.log(url);
  fetch(url, { mode: 'cors' })
    .then((response) => response.text())
    .then((result) => {
      const resultDiv = document.createElement('div');
      resultDiv.textContent = result;
      document.body.appendChild(resultDiv);
    })
    .catch((error) => console.error('Error:', error));
}
const input = document.createElement('input');
input.id = 'url';
input.type = 'text';
input.value =
  'https://xclbr-api-juraj-brabec-dev.apps.sandbox-m2.ll9k.p1.openshiftapps.com/api/v1/users';
document.body.appendChild(input);
const button = document.createElement('button');
button.textContent = 'Call API';
button.onclick = callApi;
document.body.appendChild(button);
