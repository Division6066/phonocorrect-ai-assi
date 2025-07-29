import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SimpleApp() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>PhonoCorrect AI - Development Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Testing basic component rendering and Vite setup.
            </p>
            <Button onClick={() => alert('Button works!')}>
              Test Button
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SimpleApp;