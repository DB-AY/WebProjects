const etInput = document.getElementById('etInput');
const tvOutput = document.getElementById('tvOutput');
const tvStatus = document.getElementById('tvStatus');
const cbShorter = document.getElementById('cbShorter');
const btCopy = document.getElementById('btCopy');
const btShare = document.getElementById('btShare');
const imbtInfo = document.querySelector('.btn-icon');

const defaultStatusMessage = `No changes made.`;
const successMessage = `Output updated.`;
const pattern1 = /youtube\.com|youtu\.be/gi;
const pattern2 = /wiki|google\.|bing|duckduckgo/gi;

const regexs = [
  /\/\?|\/?\w{4,8}=|[#&]|\??utm[_=]/gi,
  /\.si=|\?(?:f|app)/gi,
  /\/?\w{0,9}\?usp=|&(?:sca|gs)_|\(/gi,
];
let currentRegex;
let links = [];

tvStatus.textContent = defaultStatusMessage;

etInput.addEventListener('input', () => {
  const inputText = etInput.value.trim();
  if (!inputText) {
    tvOutput.textContent = ''; // Reset if empty
    tvStatus.textContent = defaultStatusMessage;
  } else {
    // tvOutput.textContent = shortenLinks(inputText); // Mirror input
    tvStatus.textContent = successMessage;
  }
});

btCopy.addEventListener('click', () => {
  if (tvOutput.textContent) {
    navigator.clipboard.writeText(tvOutput.textContent).then(() => {
      alert('Output copied to clipboard!');
    });
  } else alert('Nothing to copy!');
});

btShare.addEventListener('click', () => {
  if (navigator.share && tvOutput.textContent) {
    navigator.share({
      title: 'Shared Output',
      text: tvOutput.textContent,
    }).catch((err) => {
      console.error('Share failed:', err);
    });
  } else alert('Sharing not supported in this browser!');
});

// Show info on the info button click
imbtInfo.addEventListener('click', () => {
  alert('This is a simple layout to manage input and output text.');
});

function setCharSet(oldLink) {
  let charSet;

  if (pattern1.test(oldLink)) charSet = 1;
  else if (pattern2.test(oldLink)) charSet = 2;
  else charSet = 0;

  currentRegex = regexs[charSet];
}
function extractAllLinks(text) {
  const urlRegex = /(https?:\/\/)?[\w-]+(\.[\w-]+)+(\.[a-z]{2,3})?(:\d+)?(\/\S*)?/gi;
  return [...text.matchAll(urlRegex)].map((match) => match[0]); // Extract all matched URLs
}

function simplifyLink(link) {
  // Simplify the link (modify this function as per your logic)
  setCharSet(link)
  return link.replace(currentRegex, ''); // Example: Remove "utm_" parameters and "&"
}

function processLinks(inputText) {
  newLinks = extractAllLinks(inputText); // Extract all links from the text
  console.log("Links: ", newLinks)
  let currentIndex = 0;
  let processedText = inputText;

  newLinks.forEach((oldLink) => {
    const startIndex = processedText.indexOf(oldLink, currentIndex);
    const endIndex = startIndex + oldLink.length;

    // Simplify the link
    const simplifiedLink = simplifyLink(oldLink);
    console.log("Simple Link: ",simplifiedLink)
    processedText =
      processedText.slice(0, startIndex) + simplifiedLink + processedText.slice(endIndex);
    
    currentIndex = startIndex + simplifiedLink.length;
  });

  return processedText;
}

etInput.addEventListener('input', () => {
  const inputText = etInput.value;
  const updatedText = processLinks(inputText); // Process the text with simplified links
  tvOutput.innerHTML = convertToHyperlinks(updatedText); // Display the processed output as clickable links
});

// Convert simplified links to clickable hyperlinks
function convertToHyperlinks(text) {
  return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
}

function shortenLinks(textInput) {
  if (!typeof textInput === 'string' || !currentRegex instanceof RegExp) {
    console.error("Invalid input or regex:", { textInput, currentRegex });
    return "";
  }
  setCharSet(textInput);
  const shortened = textInput.replace(currentRegex, "");

  console.log("Original Input:", textInput);
  console.log("Regex Used:", currentRegex);
  console.log("Shortened Output:", shortened);

  return shortened;
}
