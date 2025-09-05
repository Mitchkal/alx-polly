'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Share, Copy, Download, Check } from 'lucide-react';

import { PollShareProps } from '@/lib/types';

/**
 * PollShare Component
 *
 * This component provides sharing functionality for a poll via URL and QR code,
 * with options to copy the link and download the QR code.
 *
 * Why: Enables easy distribution of polls, increasing participation by allowing
 * users to share unique poll links or scannable QR codes.
 *
 * Assumptions:
 * - Running in a browser environment with access to window.location and navigator.clipboard.
 * - QRCodeSVG library is installed and imported correctly.
 *
 * Edge Cases:
 * - Clipboard API not supported or permission denied triggers console error.
 * - Server-side rendering: pollUrl falls back to relative path.
 * - Empty pollId or pollTitle: Component still renders but with incomplete data.
 *
 * Connections:
 * - Uses PollShareProps from '@/lib/types' for prop typing.
 * - Integrates qrcode.react for QR generation.
 * - Employs shadcn/ui components for consistent UI.
 * - Lucide icons for visual elements.
 * - Typically used alongside PollDetail for post-creation sharing.
 */
export function PollShare({ pollId, pollTitle }: PollShareProps) {
  // State for copy feedback
  // Why: Provides user feedback on successful copy
  const [copied, setCopied] = useState(false);

  // Generate poll URL
  // Assumptions: window is available client-side
  // Edge Cases: SSR fallback to relative URL
  const pollUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/polls/${pollId}`
    : `/polls/${pollId}`;

  // Handle link copying
  // Why: Allows easy sharing via clipboard
  // Edge Cases: Handles copy failures gracefully
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Handle QR code download as PNG
  // Why: Provides offline sharing option
  // Assumptions: Browser supports canvas and image manipulation
  // Edge Cases: SVG not found prevents download
  const handleDownloadQR = () => {
    const svg = document.getElementById('poll-qr-code');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      // Download the PNG file
      const downloadLink = document.createElement('a');
      downloadLink.download = `poll-${pollId}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Share className="mr-2 h-5 w-5" />
          Share Poll
        </CardTitle>
        <CardDescription>
          Share this poll with others using the link or QR code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input 
            value={pollUrl} 
            readOnly 
            onClick={(e) => e.currentTarget.select()} 
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCopyLink}
            title="Copy link"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex justify-center py-4">
          <div className="bg-white p-3 rounded-lg">
            <QRCodeSVG 
              id="poll-qr-code"
              value={pollUrl} 
              size={200} 
              level="H" 
              includeMargin={true}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleDownloadQR}
        >
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
      </CardFooter>
    </Card>
  );
}