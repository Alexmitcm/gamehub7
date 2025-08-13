import { useState } from "react";
import {
  checkAndFixAuthIssues,
  clearAuthAndReload,
  clearMetaMaskErrors,
  clearWeb3Storage,
  debugAuthState,
  debugMetaMaskIssues,
  debugWeb3State,
  preventWeb3Conflicts
} from "@/helpers/debugAuth";
import Button from "./Button";

const AuthDebugButton = () => {
  const [isDebugging, setIsDebugging] = useState(false);

  const handleDebugAuth = () => {
    setIsDebugging(true);
    debugAuthState();
    setTimeout(() => setIsDebugging(false), 1000);
  };

  const handleClearAndReload = () => {
    clearAuthAndReload();
  };

  const handleCheckAndFix = () => {
    setIsDebugging(true);
    const wasFixed = checkAndFixAuthIssues();
    setTimeout(() => setIsDebugging(false), 1000);

    if (wasFixed) {
      alert(
        "Authentication issues detected and cleared. Please refresh the page."
      );
    } else {
      alert("No authentication issues found.");
    }
  };

  const handleDebugWeb3 = () => {
    setIsDebugging(true);
    const result = debugWeb3State();
    setTimeout(() => setIsDebugging(false), 1000);

    if (result.hasConflicts) {
      alert(
        "Web3 conflicts detected! Check console for details and consider clearing Web3 storage."
      );
    }
  };

  const handleClearWeb3Storage = () => {
    if (confirm("This will clear all Web3-related storage. Continue?")) {
      clearWeb3Storage();
      alert("Web3 storage cleared. Please refresh the page.");
    }
  };

  const handlePreventConflicts = () => {
    setIsDebugging(true);
    preventWeb3Conflicts();
    setTimeout(() => setIsDebugging(false), 1000);
    alert("Web3 conflict prevention completed. Check console for details.");
  };

  const handleDebugMetaMask = () => {
    setIsDebugging(true);
    const result = debugMetaMaskIssues();
    setTimeout(() => setIsDebugging(false), 1000);

    if (!result.isMetaMaskInstalled) {
      alert("MetaMask not detected! Please install the MetaMask extension.");
    } else if (result.hasConnectionErrors) {
      alert(
        "MetaMask connection errors detected. Check console for details and try clearing Web3 storage."
      );
    } else {
      alert(
        "MetaMask appears to be working correctly. Check console for detailed diagnostics."
      );
    }
  };

  const handleClearMetaMaskErrors = () => {
    if (confirm("This will clear all MetaMask connection errors. Continue?")) {
      clearMetaMaskErrors();
      alert("MetaMask errors cleared. Please refresh the page.");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
      <Button
        loading={isDebugging}
        onClick={handleDebugAuth}
        outline
        size="sm"
        variant="primary"
      >
        Debug Auth
      </Button>
      <Button
        loading={isDebugging}
        onClick={handleCheckAndFix}
        outline
        size="sm"
        variant="primary"
      >
        Check & Fix
      </Button>
      <Button
        onClick={handleClearAndReload}
        outline
        size="sm"
        variant="primary"
      >
        Clear & Reload
      </Button>
      <Button
        loading={isDebugging}
        onClick={handleDebugWeb3}
        outline
        size="sm"
        variant="primary"
      >
        Debug Web3
      </Button>
      <Button
        onClick={handleClearWeb3Storage}
        outline
        size="sm"
        variant="primary"
      >
        Clear Web3 Storage
      </Button>
      <Button
        loading={isDebugging}
        onClick={handlePreventConflicts}
        outline
        size="sm"
        variant="primary"
      >
        Prevent Conflicts
      </Button>
      <Button
        loading={isDebugging}
        onClick={handleDebugMetaMask}
        outline
        size="sm"
        variant="primary"
      >
        Debug MetaMask
      </Button>
      <Button
        onClick={handleClearMetaMaskErrors}
        outline
        size="sm"
        variant="primary"
      >
        Clear MetaMask Errors
      </Button>
    </div>
  );
};

export default AuthDebugButton;
