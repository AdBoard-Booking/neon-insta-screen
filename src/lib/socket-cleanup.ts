// Socket type is used in the global window interface declaration

/**
 * Utility function to properly cleanup socket connections
 * This should be called when the page is being unloaded
 */
export const cleanupSocketConnections = () => {
  // Get all socket instances from the global scope
  const globalSocket = window.globalSocketInstance;
  
  if (globalSocket) {
    console.log('Cleaning up global socket connection');
    globalSocket.removeAllListeners();
    globalSocket.disconnect();
    window.globalSocketInstance = null;
  }
};

/**
 * Hook to handle page unload cleanup
 * This ensures socket connections are properly closed when the user navigates away
 */
export const usePageUnloadCleanup = () => {
  if (typeof window !== 'undefined') {
    const handleBeforeUnload = () => {
      cleanupSocketConnections();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Page is being hidden, cleanup after a delay
        setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            cleanupSocketConnections();
          }
        }, 5000); // Wait 5 seconds before cleanup
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }
};
