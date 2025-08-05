// Authentication utility functions

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('authToken');
};

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('authToken');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Create authenticated API request headers
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Login function
export const login = async (email, password) => {
  try {
    const response = await fetch('https://backend-yv2f.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      setToken(data.token);
      return { success: true, data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};

// Logout function
export const logout = () => {
  removeToken();
  // Redirect to login page or home
  window.location.href = '/';
};

// Register function
export const register = async (userData) => {
  try {
    const response = await fetch('https://backend-yv2f.onrender.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (response.ok) {
      setToken(data.token);
      return { success: true, data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
}; 