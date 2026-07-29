const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const classifyBtn = document.getElementById('classifyBtn');
const resultBox = document.getElementById('resultBox');
const loadingMsg = document.getElementById('loadingMsg');

let base64Image = null;

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    base64Image = reader.result;
    previewImage.src = base64Image;
    previewImage.style.display = 'block';
    classifyBtn.disabled = false;
  };
  reader.readAsDataURL(file);
});

classifyBtn.addEventListener('click', async () => {
  if (!base64Image) return;

  resultBox.style.display = 'none';
  loadingMsg.style.display = 'block';
  classifyBtn.disabled = true;

  try {
    const response = await fetch('http://127.0.0.1:5000/api/classify-waste', {
    
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    });

    const data = await response.json();
    loadingMsg.style.display = 'none';
    classifyBtn.disabled = false;

    if (data.error) {
      alert('Error: ' + data.error);
      return;
    }

    const parsed = JSON.parse(data.result);

    document.getElementById('itemName').textContent = parsed.item;
    document.getElementById('categoryTag').textContent = 'Category: ' + parsed.category;
    document.getElementById('disposalTip').textContent = parsed.tip;
    resultBox.style.display = 'block';

  } catch (err) {
    loadingMsg.style.display = 'none';
    classifyBtn.disabled = false;
    alert('Something went wrong. Try again.');
    console.error(err);
  }
});