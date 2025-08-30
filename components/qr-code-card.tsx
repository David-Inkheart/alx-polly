"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeCardProps {
  url: string;
}

export function QRCodeCard({ url }: QRCodeCardProps) {
  return (
    <Card className="w-full max-w-xs">
      <CardHeader>
        <CardTitle>Scan to Vote</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-6">
        <QRCodeCanvas value={url} size={200} />
      </CardContent>
    </Card>
  );
}