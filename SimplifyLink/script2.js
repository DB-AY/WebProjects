
// DOM Elements
const etInput = document.getElementById('etInput');
const tvOutput = document.getElementById('tvOutput');
const tvStatus = document.getElementById('tvStatus');
const cbShorter = document.getElementById('cbShorter');
const btCopy = document.getElementById('btCopy');
const btShare = document.getElementById('btShare');
const imbtInfo = document.querySelector('.btn-icon');

// Default Status Messages
const defaultStatusMessage = `No changes made.`;
const successMessage = `Output updated.`;

// Initialize status message
tvStatus.textContent = defaultStatusMessage;

// Update output when the input changes
etInput.addEventListener('input', () => {
  const inputText = etInput.value.trim();
  if (!inputText) {
    tvOutput.textContent = 'Output'; // Reset if empty
    tvStatus.textContent = defaultStatusMessage;
  } else {
    tvOutput.textContent = inputText; // Mirror input
    tvStatus.textContent = successMessage;
  }
});

// Copy the output text to clipboard
btCopy.addEventListener('click', () => {
  if (tvOutput.textContent) {
    navigator.clipboard.writeText(tvOutput.textContent).then(() => {
      alert('Output copied to clipboard!');
    });
  } else {
    alert('Nothing to copy!');
  }
});

// Share the output text
btShare.addEventListener('click', () => {
  if (navigator.share && tvOutput.textContent) {
    navigator.share({
      title: 'Shared Output',
      text: tvOutput.textContent,
    }).catch((err) => {
      console.error('Share failed:', err);
    });
  } else {
    alert('Sharing not supported in this browser!');
  }
});

// Show info on the info button click
imbtInfo.addEventListener('click', () => {
  alert('This is a simple layout to manage input and output text.');
});
