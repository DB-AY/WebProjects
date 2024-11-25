class LinkSimplifier {
   constructor() {
     this.etInput = document.querySelector('#etInput');
     this.tvOutput = document.querySelector('#tvOutput');
     this.tvStatus = document.querySelector('#tvStatus');
     this.cvFindReplace = document.querySelector('#cvFindReplace');
     this.trButtons = document.querySelector('#trButtons');
     this.btCopy = document.querySelector('#btCopy');
     this.btShare = document.querySelector('#btShare');
     this.cbShorter = document.querySelector('#cbShorter');
     this.imbtInfo = document.querySelector('#imbtInfo');
     this.newLinks = [];
     this.regexs = [
       /\/\?|\/?\w{4,8}=|[#&]|utm[_=]/gi,
       /\.si=|\?(?:f|app)/gi,
       /\/?\w{0,9}\?usp=|&(?:sca|gs)_|\(/gi
     ];
     this.autoPaste = this.getSetting('AutoPaste', 1) === 1 ? 10 : -1;
     this.autoCopy = this.getSetting('AutoCopy', 1) === 1 ? 300 : this.getSetting('AutoCopy', 1) === 2 ? 2000 : -1;
     this.defaultStatusMessage = `No changes made. Tap text to copy.`;
     this.successMessage = `Link simplified. Tap link to open.`;
 
     this.init();
   }
 
   getSetting(key, defaultValue) {
     // Stub for a settings retrieval mechanism
     return defaultValue;
   }
 
   init() {
     this.cvFindReplace.style.display = 'none';
     this.trButtons.style.display = 'block';
     this.etInput.addEventListener('input', this.debounce(500, () => this.makeLinkClickable()));
     this.cbShorter.addEventListener('change', () => this.makeLinkClickable());
     this.imbtInfo.addEventListener('click', () => this.showInfoDialog());
     this.btCopy.addEventListener('click', () => this.copyOutput());
     this.btShare.addEventListener('click', () => this.shareOutput());
     this.tvStatus.textContent = this.defaultStatusMessage;
     this.etInput.placeholder = "Enter link here...";
   }
 
   debounce(delay, callback) {
     let timeoutId;
     return () => {
       clearTimeout(timeoutId);
       timeoutId = setTimeout(callback, delay);
     };
   }
 
   makeLinkClickable() {
     const input = this.etInput.value.trim();
     if (!input) {
       this.tvOutput.textContent = '';
       this.tvStatus.textContent = this.defaultStatusMessage;
       return;
     }
     this.tvStatus.textContent = this.successMessage;
     this.newLinks = this.extractAllLinks(input, true);
 
     let newInput = input;
     for (let link of this.newLinks) {
       const shortLink = this.simplifyLink(link);
       newInput = newInput.replace(link, shortLink);
     }
 
     this.tvOutput.innerHTML = this.formatLinks(newInput);
   }
 
   simplifyLink(link) {
     if (!link) return '';
     let result = link.replace(/\W+$/, '');
     if (this.cbShorter.checked) {
       result = result.replace(/https?:\/\//i, '');
     }
     return result;
   }
 
   formatLinks(input) {
     return input.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
   }
 
   extractAllLinks(text, useCustomRegex) {
     if (useCustomRegex) {
       const customRegex = /(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?/gi;
       return [...text.matchAll(customRegex)].map(match => match[0]);
     } else {
       const urlRegex = /https?:\/\/[^\s]+/gi;
       return [...text.matchAll(urlRegex)].map(match => match[0]);
     }
   }
 
   copyOutput() {
     if (this.tvOutput.textContent) {
       navigator.clipboard.writeText(this.tvOutput.textContent).then(() => {
         this.showToast('Links copied to clipboard.');
       });
     }
   }
 
   shareOutput() {
     if (this.tvOutput.textContent) {
       console.log('Sharing:', this.tvOutput.textContent);
       // Web Share API or fallback logic
     }
   }
 
   showToast(message) {
     alert(message); // Replace with a more user-friendly toast mechanism if desired
   }
 
   showInfoDialog() {
     alert("This tool simplifies links by removing unnecessary query parameters.");
   }
}
 
// Initialize the application
const linkSimplifier = new LinkSimplifier();
