
async function getThemeFromGoogleAI(theme) {
  const url = '/api/generate';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ theme: theme }),
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.text(); 
}


async function generatePalette() {
    const theme = document.getElementById('themeInput').value;
    const justificationDiv = document.getElementById('output');
    const swatchesContainer = document.getElementById('swatchesContainer');

    if (!theme.trim()) {
        alert("Please enter a theme.");
        return;
    }

    justificationDiv.textContent = "Generating your palette... 🎨";
    swatchesContainer.innerHTML = '';

    try {
        const jsonString = await getThemeFromGoogleAI(theme);
        const data = JSON.parse(jsonString);
        justificationDiv.textContent = data.justification;

        data.palette.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color.hex;
            
            // Added a class "hex-code" to the div displaying the hex value
            swatch.innerHTML = `
                <div class="swatch-info">
                    <div>${color.name} (${color.role})</div>
                    <div class="hex-code">${color.hex}</div>
                </div>
            `;
            
            // --- START: Added Functionality ---
            // Add a click event listener to the entire swatch for copying
            swatch.addEventListener('click', () => {
                const hexElement = swatch.querySelector('.hex-code');
                
                // Use the Clipboard API to copy the hex code
                navigator.clipboard.writeText(color.hex).then(() => {
                    // Provide visual feedback on success
                    const originalText = hexElement.textContent;
                    hexElement.textContent = 'Copied! ✅';
                    
                    // Revert the text back to the hex code after 2 seconds
                    setTimeout(() => {
                        hexElement.textContent = originalText;
                    }, 2000);
                }).catch(err => {
                    // Handle potential errors
                    console.error('Error copying text: ', err);
                    alert('Failed to copy color.');
                });
            });
            // --- END: Added Functionality ---

            swatchesContainer.appendChild(swatch);
        });

    } catch (error) {
        console.error("Error generating palette:", error);
        justificationDiv.textContent = `Sorry, there was an error. (${error.message})`;
    }
}
// --- START: Added Light/Dark Mode Toggle Functionality ---

// Get the button and check for saved user preference
const themeToggle = document.getElementById('themeToggle');
const userTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Function to set the theme and icon
const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️'; // Sun icon for dark mode
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.textContent = '🌙'; // Moon icon for light mode
    }
};

// Apply the theme on initial load
if (userTheme === 'dark' || (!userTheme && systemTheme)) {
    applyTheme('dark');
} else {
    applyTheme('light');
}

// Add click listener to the toggle button
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        localStorage.setItem('theme', 'light'); // Save preference
        applyTheme('light');
    } else {
        localStorage.setItem('theme', 'dark'); // Save preference
        applyTheme('dark');
    }
});

