import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Keyboard as KeyboardIcon } from "@phosphor-icons/react";

interface VirtualKeyboardProps {
  onInput: (input: string) => void;
  onSpecialKey: (key: string) => void;
  targetRef: React.RefObject<HTMLElement>;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onInput,
  onSpecialKey
}) => {
  const keys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <KeyboardIcon size={16} />
          Virtual Keyboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {keys.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-center">
              {row.map((key) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => onInput(key)}
                  className="w-8 h-8 p-0"
                >
                  {key}
                </Button>
              ))}
            </div>
          ))}
          <div className="flex gap-1 justify-center mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInput(' ')}
              className="px-8"
            >
              Space
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSpecialKey('Backspace')}
            >
              ⌫
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSpecialKey('Enter')}
            >
              ↵
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};