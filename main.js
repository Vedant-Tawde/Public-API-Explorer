/**
 * Public API Explorer
 * Main JavaScript logic handling API fetches and dom updates.
 */

// Utility: Show loading spinner in a given container
const showLoader = (container) => {
  container.innerHTML = '<div class="loader"></div>';
};

// Utility: Show error message in a given container
const showError = (container, message) => {
  container.innerHTML = `
    <div class="placeholder-state" style="color: var(--danger-color)">
      <i class="ph ph-warning-circle"></i>
      <p>${message}</p>
    </div>
  `;
};

// Utility: Toast notification system
const showToast = (message, type = 'success') => {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '<i class="ph ph-check-circle"></i>' : '<i class="ph ph-warning-circle"></i>';
  toast.innerHTML = `${icon} <span>${message}</span>`;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
};

// Set button loading state
const setButtonLoading = (btn, isLoading, originalIcon, originalText) => {
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = `<i class="ph ph-spinner spin"></i> Loading...`;
  } else {
    btn.disabled = false;
    btn.innerHTML = `<i class="${originalIcon}"></i> ${originalText}`;
  }
};

/**
 * 1. Dog API Implementation
 */
const setupDogAPI = () => {
  const btn = document.getElementById('btn-get-dog');
  const copyBtn = document.getElementById('btn-copy-dog');
  const resultArea = document.getElementById('dog-result');
  const infoArea = document.getElementById('dog-info');
  const breedBadge = document.getElementById('dog-breed');
  
  let currentImageUrl = '';

  btn.addEventListener('click', async () => {
    setButtonLoading(btn, true, 'ph ph-paw-prints', 'Get Dog');
    showLoader(resultArea);
    infoArea.classList.add('hidden');
    copyBtn.classList.add('hidden');

    try {
      const response = await fetch('https://dog.ceo/api/breeds/image/random');
      if (!response.ok) throw new Error('Failed to fetch dog image');
      
      const data = await response.json();
      currentImageUrl = data.message;
      
      // Parse breed from URL: https://images.dog.ceo/breeds/hound-afghan/n02089867_3174.jpg
      const urlParts = currentImageUrl.split('/');
      const breedPart = urlParts[urlParts.indexOf('breeds') + 1];
      const breed = breedPart ? breedPart.replace('-', ' ') : 'Unknown Breed';

      // Load image
      const img = new Image();
      img.src = currentImageUrl;
      img.className = 'result-image';
      img.onload = () => {
        resultArea.innerHTML = '';
        resultArea.appendChild(img);
        breedBadge.textContent = breed;
        infoArea.classList.remove('hidden');
        copyBtn.classList.remove('hidden');
        setButtonLoading(btn, false, 'ph ph-paw-prints', 'Get Dog');
      };

    } catch (err) {
      showError(resultArea, 'Could not fetch a dog. Try again later.');
      setButtonLoading(btn, false, 'ph ph-paw-prints', 'Get Dog');
    }
  });

  // Copy URL functionality
  copyBtn.addEventListener('click', () => {
    if (currentImageUrl) {
      navigator.clipboard.writeText(currentImageUrl).then(() => {
        showToast('Image URL copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Failed to copy text', 'error');
      });
    }
  });
};

/**
 * 2. Joke Generator API Implementation
 */
const setupJokeAPI = () => {
  const btn = document.getElementById('btn-get-joke');
  const nextBtn = document.getElementById('btn-next-joke');
  const resultArea = document.getElementById('joke-result');

  const fetchJoke = async () => {
    setButtonLoading(btn, true, 'ph ph-sparkle', 'Get Joke');
    setButtonLoading(nextBtn, true, 'ph ph-arrow-right', 'Next');
    showLoader(resultArea);

    try {
      const response = await fetch('https://v2.jokeapi.dev/joke/Any');
      if (!response.ok) throw new Error('Failed to fetch joke');
      
      const data = await response.json();
      
      if (data.type === 'single') {
        resultArea.innerHTML = `
          <div class="joke-punchline">${data.joke}</div>
        `;
      } else {
        resultArea.innerHTML = `
          <div class="joke-setup">${data.setup}</div>
          <div class="joke-punchline">${data.delivery}</div>
        `;
      }
      
      // Update UI for next interactions
      btn.classList.add('hidden');
      nextBtn.classList.remove('hidden');
      setButtonLoading(nextBtn, false, 'ph ph-arrow-right', 'Next');
      
    } catch (err) {
      showError(resultArea, 'Failed to tell a joke. Too serious today.');
      setButtonLoading(btn, false, 'ph ph-sparkle', 'Get Joke');
      setButtonLoading(nextBtn, false, 'ph ph-arrow-right', 'Next');
    }
  };

  btn.addEventListener('click', fetchJoke);
  nextBtn.addEventListener('click', fetchJoke);
};

/**
 * 3. Random User API Implementation
 */
const setupUserAPI = () => {
  const btn = document.getElementById('btn-get-user');
  const resultArea = document.getElementById('user-result');

  btn.addEventListener('click', async () => {
    setButtonLoading(btn, true, 'ph ph-users', 'Get User');
    showLoader(resultArea);

    try {
      const response = await fetch('https://randomuser.me/api/');
      if (!response.ok) throw new Error('Failed to fetch user');
      
      const data = await response.json();
      const user = data.results[0];
      
      resultArea.innerHTML = `
        <div class="profile-info">
          <img src="${user.picture.large}" alt="Profile Picture" class="profile-img" />
          <h3>${user.name.first} ${user.name.last}</h3>
          <p><i class="ph ph-envelope"></i> ${user.email}</p>
          <p><i class="ph ph-map-pin"></i> ${user.location.country}</p>
          <p><i class="ph ph-phone"></i> ${user.phone}</p>
          <p><i class="ph ph-calendar"></i> Age: ${user.dob.age}</p>
        </div>
      `;
    } catch (err) {
      showError(resultArea, 'Could not load user data.');
    } finally {
      setButtonLoading(btn, false, 'ph ph-users', 'Get User');
    }
  });
};



/**
 * 5. Advice Generator API
 */
const setupAdviceAPI = () => {
  const btn = document.getElementById('btn-get-advice');
  const resultArea = document.getElementById('advice-result');

  btn.addEventListener('click', async () => {
    setButtonLoading(btn, true, 'ph ph-magic-wand', 'Get Advice');
    showLoader(resultArea);

    try {
      // API response might be cached by browser. Adding timestamp query overrides cache
      const response = await fetch('https://api.adviceslip.com/advice?t=' + Date.now());
      if (!response.ok) throw new Error('Failed to fetch advice');
      
      const data = await response.json();
      
      resultArea.innerHTML = `
        <div class="joke-punchline" style="font-size: 1.1rem; color: var(--text-main); font-weight: 500;">
          "${data.slip.advice}"
        </div>
      `;
    } catch (err) {
      showError(resultArea, 'Could not load advice.');
    } finally {
      setButtonLoading(btn, false, 'ph ph-magic-wand', 'Get Advice');
    }
  });
};

/**
 * 6. Random Fact API
 */
const setupFactAPI = () => {
  const btn = document.getElementById('btn-get-fact');
  const resultArea = document.getElementById('fact-result');

  btn.addEventListener('click', async () => {
    setButtonLoading(btn, true, 'ph ph-magnifying-glass', 'Get Fact');
    showLoader(resultArea);

    try {
      const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
      if (!response.ok) throw new Error('Failed to fetch fact');
      
      const data = await response.json();
      
      resultArea.innerHTML = `
        <div class="joke-punchline" style="font-size: 1.1rem; color: var(--accent-1); font-weight: 500;">
          ${data.text}
        </div>
      `;
    } catch (err) {
      showError(resultArea, 'Could not load fact.');
    } finally {
      setButtonLoading(btn, false, 'ph ph-magnifying-glass', 'Get Fact');
    }
  });
};

/**
 * 7. Cat Image API
 */
const setupCatAPI = () => {
  const btn = document.getElementById('btn-get-cat');
  const resultArea = document.getElementById('cat-result');

  btn.addEventListener('click', async () => {
    setButtonLoading(btn, true, 'ph ph-paw-prints', 'Get Cat');
    showLoader(resultArea);

    try {
      const response = await fetch('https://api.thecatapi.com/v1/images/search');
      if (!response.ok) throw new Error('Failed to fetch cat');
      
      const data = await response.json();
      const imageUrl = data[0].url;
      
      const img = new Image();
      img.src = imageUrl;
      img.className = 'result-image';
      img.onload = () => {
        resultArea.innerHTML = '';
        resultArea.appendChild(img);
        setButtonLoading(btn, false, 'ph ph-paw-prints', 'Get Cat');
      };
    } catch (err) {
      showError(resultArea, 'Could not fetch a cat.');
      setButtonLoading(btn, false, 'ph ph-paw-prints', 'Get Cat');
    }
  });
};

// Initialize everything on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  setupDogAPI();
  setupJokeAPI();
  setupUserAPI();

  setupAdviceAPI();
  setupFactAPI();
  setupCatAPI();
});
