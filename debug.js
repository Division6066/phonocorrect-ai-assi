console.log("Testing basic JS syntax");

// Test basic imports
try {
  const React = require('react');
  console.log("React imported successfully");
} catch (e) {
  console.log("React import failed:", e.message);
}

console.log("Basic checks complete");