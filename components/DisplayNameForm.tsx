"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DisplayNameFormProps {
  onNameSubmit: (name: string) => void;
  disabled: boolean;
}

export function DisplayNameForm({ onNameSubmit, disabled }: DisplayNameFormProps) {
  const [name, setName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('displayName', name.trim());
      onNameSubmit(name.trim());
      setHasJoined(true);
    }
  };

  const handleChangeName = () => {
    setHasJoined(false);
  };

  if (hasJoined) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Joined as: <span className="font-medium">{name}</span>
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleChangeName}
          type="button"
        >
          Change Name
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          disabled={disabled}
          required
          maxLength={50}
          className="max-w-xs"
        />
      </div>
      <Button 
        type="submit" 
        disabled={disabled || !name.trim()}
        size="sm"
      >
        Join Room
      </Button>
    </form>
  );
}