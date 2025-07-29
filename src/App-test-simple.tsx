import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              PhonoCorrect AI Test
              <Badge variant="outline">Build Test</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is a simple test component to verify the build system is working correctly.
            </p>
            <Button className="mt-4">Test Button</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;