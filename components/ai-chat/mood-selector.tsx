"use client";

import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllMoods, type AIMood } from "@/lib/ai-moods";

interface MoodSelectorProps {
  currentMood: AIMood;
  onMoodChange: (mood: AIMood) => void;
}

export function MoodSelector({ currentMood, onMoodChange }: MoodSelectorProps) {
  const moods = getAllMoods();
  const currentMoodData = moods.find(m => m.id === currentMood);

  return (
    <Select value={currentMood} onValueChange={(value) => onMoodChange(value as AIMood)}>
      <SelectTrigger className="h-9 w-auto border-none shadow-none hover:bg-muted/50 transition-colors">
        <SelectValue>
          <div className="flex items-center gap-1.5 text-sm">
            <span>{currentMoodData?.icon}</span>
            <span className="font-medium">{currentMoodData?.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {moods.map((mood) => (
          <SelectItem key={mood.id} value={mood.id}>
            <div className="flex items-center gap-2">
              <span>{mood.icon}</span>
              <div>
                <div className="font-medium text-sm">{mood.name}</div>
                <div className="text-xs text-muted-foreground">{mood.description}</div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
