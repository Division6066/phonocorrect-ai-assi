import React from 'react';
import { Button } from "@/components/ui/button";

function TestApp() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">PhonoCorrect AI - Test</h1>
      <Button>Test Button</Button>
      <p className="mt-4 text-muted-foreground">
        If you can see this, the basic setup is working!
      </p>
    </div>
  );
}

export default TestApp;