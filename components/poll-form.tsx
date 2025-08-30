"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PollForm() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create a New Poll</CardTitle>
        <CardDescription>
          Fill out the details below to create your poll.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="question">Question</Label>
          <Input id="question" placeholder="What's your favorite color?" />
        </div>
        <div className="grid gap-2">
          <Label>Options</Label>
          <Input id="option-1" placeholder="Option 1" />
          <Input id="option-2" placeholder="Option 2" />
          <Button variant="outline" className="mt-2">
            Add Option
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Create Poll</Button>
      </CardFooter>
    </Card>
  );
}