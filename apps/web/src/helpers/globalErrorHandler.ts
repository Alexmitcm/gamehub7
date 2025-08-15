// Global error handler for fetch requests
export const setupGlobalErrorHandler = () => {
  if (typeof window === 'undefined') return;

  // Store the original fetch function
  const originalFetch = window.fetch;

  // Override fetch to add error handling
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      // Clone the response so we can read it multiple times
      const clonedResponse = response.clone();
      
      // Check if the response is JSON and handle parsing errors
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          await clonedResponse.json();
        } catch (jsonError) {
          console.error('🔍 Global JSON parsing error detected:');
          console.error('🔍 URL:', args[0]);
          console.error('🔍 Method:', args[1]?.method || 'GET');
          console.error('🔍 JSON Error:', jsonError);
          
          // Try to get the response text for debugging
          try {
            const textResponse = response.clone();
            const responseText = await textResponse.text();
            console.error('🔍 Response text:', responseText);
          } catch (textError) {
            console.error('🔍 Could not read response text:', textError);
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('🔍 Global fetch error:', error);
      throw error;
    }
  };
};

// Initialize the global error handler
setupGlobalErrorHandler();
